// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client";

import PathCanvasLayout from "../paths/PathCanvasLayout";
import PathListLayout from "../paths/PathListLayout";
import { useRouter } from "next/navigation";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useState } from "react"
import { CiTimer } from "react-icons/ci";
import { FaUsersBetweenLines } from "react-icons/fa6";
import { PiCertificateBold } from "react-icons/pi";
import { FaUserTie } from "react-icons/fa";
import { GiDuration } from "react-icons/gi";
import dayjs from 'dayjs';
import { useEffect } from "react";
import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";
import { IoReturnDownBackSharp } from "react-icons/io5";
import { genQueryParamsForRequest } from "@/lib/frontend/utils";

const ICON_SET = {
  not_started: '/icons/course-notyet.png',
  in_progress: '/icons/course-learning.png',
  completed: '/icons/course-done.png',
  locked: '/icons/course-locked.png',
}

const fetchProgressForCourses = async (course_ids) => {
  if (!course_ids) return null
  try {

    const res = await fetch(`/api/progress/courses/bulk/${course_ids}?${genQueryParamsForRequest()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update lesson state");
    }
    return await res.json();
  } catch (err) {
    console.error("Error saving lesson finish state:", err);
    return null;
  }
}

function addMediaUrlForCourses(path, courses) {

  if (!path || !courses) return
  let ICONS = path.icon_set || ICON_SET

  courses.forEach((course) => {
    switch (course.context?.state) {
      case STATE_NOT_STARTED:
        course.icon = ICONS.not_started;
        break;
      case STATE_IN_PROGRESS:
        course.icon = ICONS.in_progress;
        break;
      case STATE_COMPLETED:
        course.icon = ICONS.completed;
        break;
      case STATE_LOCKED:
        course.icon = ICONS.locked;
        break;
      default:
        course.icon = ICONS.not_started;
    }
    // console.log(course.icon)
  });
}

const InfoGroup = ({ title, content }) => {
  const [collapsed, setCollapsed] = useState(true)

  return <div className="border-b border-neutral-200">
    <div className="mt-1 flex items-center">
      <div className="grow text-lg font-semibold text-neutral-800 cursor-pointer"
        onClick={() => {
          setCollapsed((v) => !v)
        }}>{title}</div>
      {collapsed && <IoIosArrowDown size={20}
        onClick={() => { setCollapsed(false) }}
        className="text-neutral-800 cursor-pointer hover:opacity-70" />}
      {!collapsed && <IoIosArrowUp size={20}
        onClick={() => { setCollapsed(true) }}
        className="text-neutral-800 cursor-pointer hover:opacity-70" />}
    </div>
    {!collapsed && <div className="mt-0 text-sm text-neutral-700 min-h-[30px]">{content}</div>}

  </div>
}

const PathScreen = ({ path }) => {
  const router = useRouter();
  const [courses, setCourses] = useState([])
  const [maps, setMaps] = useState([])
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [pathStats, setPathStats] = useState({ num_learners: 0, num_certified_learners: 0 })

  useEffect(() => {
    console.log(`path`, path)
    if (path && path.courses) {
      console.log("Courses with progress context:", JSON.stringify(path.courses.map(c => ({
        _id: c._id,
        name: c.name,
        context: c.context
      })), null, 2));
    }
  }, [path])

  useEffect(() => {
    console.log(`courses`, courses)
  }, [courses])

  useEffect(() => {
    console.log(`maps`, maps)
  }, [maps])

  useEffect(() => {
    if (path) {
      let courses = path?.courses || []
      let maps = path?.maps || []
      if (courses.length > 0 && maps.length > 0) {
        maps.forEach(map => {
          if (map.course_id) {
            // Course item
            map.course = courses.find(c => c._id === map.course_id)
          } else if (map.certificate_id) {
            // Certificate item - no course needed
            map.course = null
          }
        })
      }
      setMaps(maps)
      setCourses(courses)
      setUpdateTrigger(1)
    }
  }, [path])

  useEffect(() => {
    if (updateTrigger) {
      if (path?.course_ids || path?.courses) {
        // updateProgressForCourses() // No need this anymore
        updatePathProgress()
        updatePathStats()
      }
    }
  }, [updateTrigger])

  const updateProgressForCourses = async () => {
    if (!path) return
    if (!path?.course_ids) {
      path.course_ids = path?.courses?.map(c => c._id) || []
    }
    try {
      let res = await fetchProgressForCourses(path?.course_ids.join(','))
      if (res.success && res.data) {
        let progresses = res.data
        // console.log(`progresses`, progresses)
        let tmpCourses = JSON.parse(JSON.stringify(courses))
        // TODO: temp solutions, set award state on frontend base on other course state, later: no need, backend will do that
        let isPathFinish = true

        tmpCourses.forEach(course => {
          let matchProgress = progresses.find(p => p.course_id === course._id)
          if (matchProgress) {
            course.context = {
              state: matchProgress.state,
              progress: matchProgress
            }


            // Update lesson states based on progress
            if (course.lessons && matchProgress.lessons) {
              course.lessons.forEach(lesson => {
                let lessonProgress = matchProgress.lessons[lesson.slug]
                if (lessonProgress) {
                  lesson.context = {
                    state: lessonProgress.state,
                    progress: lessonProgress
                  }
                }
              })
            }
          }

          if (course.type != 'award') {
            if (!course.context?.state || course.context?.state != 'completed') {
              isPathFinish = false
            }
          }
        })

        // TODO: temp solutions, set award state on frontend base on other course state, later: no need, backend will do that
        if (isPathFinish) {
          tmpCourses.forEach(course => {
            if (course.type == 'award') {
              course.context = {
                state: 'completed'
              }
            }
          })
        }

        addMediaUrlForCourses(path, tmpCourses)
        setCourses(tmpCourses)

        if (tmpCourses && tmpCourses.length > 0 && maps && maps.length > 0) {
          let hasChanged = false
          let tmpMaps = JSON.parse(JSON.stringify(maps))
          tmpMaps.forEach(map => {
            if (map.course_id) {
              // Course item
              let matchCourse = tmpCourses.find(c => c._id === map.course_id)
              if (matchCourse != map.course) {
                map.course = matchCourse
                hasChanged = true
              }
            }
            // Certificate items don't need course updates
          })
          if (hasChanged) {
            setMaps(tmpMaps)
          }
        } else {
          console.log(`no maps or courses`)
          setMaps([])
        }
      } else {
        console.log(`no course_ids`)
        setMaps([])
        setCourses([])
      }
    } catch (err) {
      console.log(`error`, err)
    }
  }

  const fetchPathProgress = async (path_id) => {
    if (!path_id) return null
    try {
      const res = await fetch(`/api/progress/paths/${path_id}?${genQueryParamsForRequest()}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) return null
      return await res.json()
    } catch (_) { return null }
  }

  const fetchPathStats = async (path_id) => {
    if (!path_id) return null
    try {
      const res = await fetch(`/api/paths/stats?path_id=${path_id}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) return null
      return await res.json()
    } catch (_) { return null }
  }

  const updatePathProgress = async () => {
    try {
      const res = await fetchPathProgress(path?._id)
      if (res && res.success && res.data) {
        // attach path-level context
        let ctxState = res.data.state
        // Show a simple banner for path-level status
        // We keep it in state via maps/courses re-render currently
        // set icon by state
        let tmpCourses = JSON.parse(JSON.stringify(courses))
        addMediaUrlForCourses({ ...path, icon_set: path.icon_set }, tmpCourses)
        setCourses(tmpCourses)
      }
    } catch (_) { }
  }

  const updatePathStats = async () => {
    try {
      const res = await fetchPathStats(path?._id)
      if (res && res.success && res.data) {
        setPathStats(res.data)
      }
    } catch (_) { }
  }

  if (!path) return;

  return (
    <div className="m-0 p-0 w-full h-full bg-white select-none">
      {/* Title block */}
      <div className="py-4 sm:py-4 px-2 lg:px-4">
        <div className="flex items-center my-2">
          {/* <IoArrowBack size={28} className="cursor-pointer hover:scale-120 mr-4 text-black" 
              onClick={() => { router.back() }} /> */}
          <div className="text-neutral-950 text-xl md:text-3xl font-semibold grow">{path.name}</div>
          <div className="min-w-8 h-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4 ">
          <div className="mt-2 pl-0 pr-4 md:pr-6 py-2 ">
            <div className="leading-tight text-base md:text-[16px] text-neutral-800">
              {path.description}
            </div>

            {path.time_to_complete && <div className="my-1 flex items-center text-sm text-neutral-500">
              <GiDuration size={20} className='mr-2 text-neutral-400' />
              <span className="mr-2">Time to completed:</span>
              Approx. <span className="mx-1"><b>{path.time_to_complete} </b></span> hours
            </div>}

            {/* Created by and last updated date */}
            <div className='text-neutral-500 text-sm  my-2 flex flex-row items-center space-x-2'>
              <div className='flex flex-row items-center w-[220px]'>
                <CiTimer size={20} className='mr-2 text-neutral-400' />
                <div> Updated <b>{dayjs(path.updated_at || path.created_at).format('MMM DD, YYYY')}</b></div>
              </div>
              <div className='flex flex-row items-center'>
                <FaUserTie size={18} className='mr-2 text-neutral-400' />
                <div>Instructor</div>
                <div className='ml-1'><b>{path.created_by}</b></div>
              </div>
            </div>

            {/* Statistics */}
            <div className='text-neutral-500 text-sm italic my-2 flex flex-row items-center space-x-2'>
              <div className='flex flex-row items-center w-[220px]'>
                <FaUsersBetweenLines size={20} className="mr-2 text-neutral-400" />
                <span className="mr-1 text-neutral-900"><b>{pathStats.num_learners || 0}</b></span> learners
              </div>

              <div className='flex flex-row items-center'>
                <PiCertificateBold size={22} className="mr-2 text-neutral-400" />
                <span className="mr-1 text-neutral-900"><b>{pathStats.num_certified_learners || 0}</b></span> learners got certification
              </div>
            </div>

          </div>

          <div className="mt-2 w-full px-2 md:px-6 ">
            {path.key_points?.map((item, index) => <InfoGroup
              key={index} title={item.title} content={item.content} />)}
          </div>
        </div>

      </div>

      <div className="min-h-[400px]">
        {
          path.configs?.display_type === "canvas" && <PathCanvasLayout path={path} maps={maps}
            onRequestUpdateProgress={() => {
              setUpdateTrigger(0)
              setTimeout(() => { setUpdateTrigger(1) }, 200)
            }} />
        }

        {
          path.configs?.display_type !== "canvas" && <PathListLayout path={path} courses={courses}
            onRequestUpdateProgress={() => {
              setUpdateTrigger(0)
              setTimeout(() => { setUpdateTrigger(1) }, 200)
            }} />
        }
      </div>
    </div>
  );
};

export default PathScreen;
