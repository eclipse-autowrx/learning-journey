// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

"use client"

import { useEffect, useState, useRef } from 'react';
import { MdOutlineQuiz } from "react-icons/md";
import { GoVideo } from "react-icons/go";
import { SlNotebook } from "react-icons/sl";
import QuizLesson from '../lessons/QuizLesson';
import VideoLesson from '../lessons/VideoLesson';
import TextMarkdownLesson from '../lessons/TextMarkdownLesson';
import { STATE_COMPLETED, STATE_IN_PROGRESS, STATE_NOT_STARTED } from "@/lib/const";
import { FaCheckCircle } from "react-icons/fa";
import BtnFullRounded from '../atom/BtnFullRounded';
import { useRouter } from "next/navigation";

import { genQueryParamsForRequest } from '@/lib/frontend/utils';
import InteractiveLesson from '../lessons/InteractiveLesson';
import { showToast } from "@/lib/utils/notifications";
import { saveStateCourseStarted } from "@/lib/frontend/course";

const saveStateLessonFinish = async (course, lesson_slug, data) => {
    if (!course || !course._id || !lesson_slug) return null
    // console.log('saveStateLessonFinish', course, lesson_slug, data)
    try {

        let payload = {
            course_id: course._id,
            state: STATE_COMPLETED,
            record: {
                action: 'Finish lesson',
                data: data,
                refId: '',
                refType: '',
            }
        }

        // console.log("Set Lesson Finished", lesson_slug)
        const res = await fetch(`/api/progress/courses/${course._id}/lessons/${lesson_slug}?${genQueryParamsForRequest()}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
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

const saveStateLessonStart = async (course, lesson_slug, data) => {
    if (!course || !course._id || !lesson_slug) return null
    try {
        let payload = {
            course_id: course._id,
            state: STATE_IN_PROGRESS,
            record: {
                action: 'Start lesson',
                data: data || {},
                refId: '',
                refType: '',
            }
        }
        const res = await fetch(`/api/progress/courses/${course._id}/lessons/${lesson_slug}?${genQueryParamsForRequest()}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to update lesson state");
        }
        return await res.json();
    } catch (err) {
        console.error("Error saving lesson start state:", err);
        return null;
    }
}

const LessonListItem = ({ lesson, isActive, onActive, index }) => {
    return <div
        className={`px-1 py-1 flex items-center cursor-pointer hover:item-border-active
            
            ${isActive ? 'item-border-active' : 'item-border'}`}
        onClick={(e) => {
            if (lesson.lock) return
            if (onActive) {
                onActive(e)
            }
        }}>
        <div className={`w-[42px] min-w-[42px] ${isActive && 'light-box' } aspect-square rounded-lg grid place-items-center`}>
            {lesson.lesson_type === 'quiz' && <img className='w-8 h-8' src='/imgs/bare/lesson_quiz.svg' alt='lesson_video'/>}
            {lesson.lesson_type === 'video' && <img className='w-8 h-8' src='/imgs/bare/lesson_video.svg' alt='lesson_video'/>}
            {lesson.lesson_type === 'text-markdown' && <img className='w-8 h-8' src='/imgs/bare/lesson_book.svg' alt='lesson_markdown'/>}
            {lesson.lesson_type === 'interactive' && <img className='w-10 h-10' src='/imgs/bare/lesson_interactive.svg' alt='lesson_interractive'/>}
        </div>
        <div className='grow pl-3 py-0 flex flex-col h-full w-full items-start'>
            <div className='w-full txt-sub-title text-sm line-clamp-2 flex items-start justify-between space-x-1'>
                 {`${index+1}. ${lesson.name}`}
                {lesson.context?.state == STATE_COMPLETED && <img src='/imgs/bare/icon_checked.svg'/>}
            </div>
            <div className='text-xs pl-5 line-clamp-1 leading-tight'>{lesson.description}</div>
        </div>
    </div>
}

const CourseScreen = ({ course, path_slug }) => {
    const router = useRouter();

    if (!course) return <></>

    const [activeLessonIndex, setActiveLessonIndex] = useState(0)
    const [activeLesson, setActiveLesson] = useState()
    const [lessonsTable, setLessonsTable] = useState([])
    const [showCourseFinishAnnounce, setShowCourseFinishAnnounce] = useState(false)
    const scrollContainerRef = useRef(null)

    useEffect(() => {
        // console.log("[CourseScreen] Course prop updated:", course);
        if (!course || !course.lessons) {
            // console.log("[CourseScreen] No course or lessons, setting empty table.");
            setLessonsTable([]);
            return;
        }

        const lessonsWithProgress = course.lessons.map(lesson => {
            const progress = course.context?.progress?.lessons?.[lesson.slug];
            if (progress) {
                return {
                    ...lesson,
                    context: {
                        state: progress.state,
                        progress: progress
                    }
                };
            } else {
                console.log(`lesson ${lesson.slug} has no progress`)
            }
            return lesson;
        });
        
        console.log("[CourseScreen] lessonsWithProgress", lessonsWithProgress);
        setLessonsTable(lessonsWithProgress);

    }, [course]);

    useEffect(() => {
        if (!lessonsTable || lessonsTable.length === 0) return;
        try {
            const lesson = lessonsTable[activeLessonIndex];
            setActiveLesson(lesson);
        } catch (err) {
            setActiveLesson(null);
        }
    }, [activeLessonIndex, lessonsTable]);

    // Always reset scroll to top-left when the active lesson changes
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.scrollTo(0, 0);
            }
            const el = scrollContainerRef.current;
            if (el && typeof el.scrollTo === 'function') {
                el.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            } else if (el) {
                el.scrollTop = 0;
                el.scrollLeft = 0;
            }
        } catch (_) {}
    }, [activeLesson?.slug]);
    
    useEffect(() => {
        console.log('activeLesson', activeLesson)
        // When switching to a lesson that has not started, mark as in_progress
        try {
            if (course && activeLesson && activeLesson?.context?.state === STATE_NOT_STARTED) {
                saveStateLessonStart(course, activeLesson.slug).then((res) => {
                    if (res && res.success) {
                        applyNewProgressToCourse(res.data)
                    }
                }).catch(() => {})
            }
        } catch(_) {}
    }, [activeLesson])

    useEffect(() => {
        if (lessonsTable && lessonsTable.length > 0) {
            setActiveLessonIndex(0)
        }
    }, [lessonsTable])

    // Mark course as started when entering if not started yet
    useEffect(() => {
        if (!course) return;
        if (course?.context?.state === STATE_NOT_STARTED) {
            try { saveStateCourseStarted(course); } catch(_) {}
        }
    }, [course?._id]);

    const gotoNextLesson = () => {
        if (activeLessonIndex < lessonsTable.length - 1) {
            setActiveLessonIndex((v) => v + 1)
        }
        if (activeLessonIndex == lessonsTable.length - 1) {
            setShowCourseFinishAnnounce(true)
            setActiveLessonIndex(-1)
        }
    }

    const applyNewProgressToCourse = async (progress) => {
        if (!progress || !progress.lessons) return;
    
        const updatedLessons = lessonsTable.map(lesson => {
            const matchProgress = progress.lessons[lesson.slug];
            if (matchProgress) {
                return {
                    ...lesson,
                    context: {
                        state: matchProgress.state,
                        progress: matchProgress
                    }
                };
            }
            return lesson;
        });
    
        setLessonsTable(updatedLessons);
    }


    return <div className='w-full h-full flex flex-col'>
        

        <div className='flex w-full h-full text-base space-x-4 overflow-auto'>
            <div className='w-1/4 min-w-[400px] px-0 rounded flex flex-col space-y-2'>
                <div className='w-full flex flex-col pb-2'>
                    <div className='text-xl leading-tight font-bold text-neutral-900'>
                        {course.name}
                    </div>
                    { course.description && <div className='text-sm text-neutral-600 leading-tight'>
                        {course.description}
                    </div> }
                </div>
                {
                    lessonsTable.length > 0 && lessonsTable.map((lesson, lIndex) => <LessonListItem key={lIndex}
                        index={lIndex}
                        lesson={lesson}
                        isActive={lIndex == activeLessonIndex}
                        onActive={(e) => {
                            setActiveLessonIndex(lIndex)
                        }} />
                    )}
            </div>

            <div className='grow border border-neutral-200 bg-white rounded flex flex-col relative' 
                style={{ maxHeight: 'calc(100vh - 40px)' }}>
                <div ref={scrollContainerRef} className='absolue w-full h-full top-0 left-0 bottom-0 right-0 overflow-y-auto'>
                    {showCourseFinishAnnounce && <div className='w-full h-full grid place-items-center'>
                        <div className='flex flex-col px-4 py-4 w-fit h-fit'>
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-primary-600 mb-4">Congratulations! 🎉</h2>
                                <p className="text-xl text-neutral-700 mb-2">You have successfully completed course:</p>
                                <p className="text-2xl font-semibold text-neutral-800 mb-4">{course.name}</p>
                                <p className="text-neutral-600">Keep up the great work and continue your learning journey!</p>
                            </div>
                            <div className='mt-10 w-full flex items-center justify-center'>
                                <BtnFullRounded onClick={() => {
                                    router.push(`/path/${path_slug}`)
                                }}>
                                    Continue Learning
                                </BtnFullRounded>
                            </div>
                        </div>
                    </div>}

                    {activeLesson && <div className='w-full h-full'>

                        {activeLesson.lesson_type === 'quiz' && <QuizLesson lesson={activeLesson}
                            onCloseRequest={() => {
                                gotoNextLesson()
                            }}
                            onSumbitLesson={async (data) => {
                                const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                if (res && res.success) {
                                    showToast.success(`Lesson "${activeLesson.name}" completed!`)
                                }
                                let newCourseProgress = res.data
                                applyNewProgressToCourse(newCourseProgress)
                            }} />}

                        {activeLesson.lesson_type === 'video' && <VideoLesson lesson={activeLesson}
                            onCloseRequest={() => {
                                gotoNextLesson()
                            }}
                            onSumbitLesson={async (data) => {
                                const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                if (res && res.success) {
                                    showToast.success(`Lesson "${activeLesson.name}" completed!`)
                                }
                                let newCourseProgress = res.data
                                applyNewProgressToCourse(newCourseProgress)
                            }}
                        />}

                        {activeLesson.lesson_type === 'text-markdown' && <TextMarkdownLesson lesson={activeLesson}
                            onCloseRequest={() => {
                                gotoNextLesson()
                            }}
                            onSumbitLesson={async (data) => {
                                let lessonInTable = lessonsTable.find(l => l.slug == activeLesson.slug)
                                // console.log('lessonInTable', lessonInTable)
                                if (lessonInTable && lessonInTable.context?.state != 'completed') {
                                    try {
                                        const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                        if (res && res.success) {
                                            showToast.success(`Lesson "${activeLesson.name}" completed!`)
                                        }
                                        let newCourseProgress = res.data
                                        applyNewProgressToCourse(newCourseProgress)
                                    } catch (e) { }
                                }

                            }}
                        />}

                        {activeLesson.lesson_type === 'interactive' && <InteractiveLesson lesson={activeLesson}
                            onCloseRequest={() => {
                                gotoNextLesson()
                            }}
                            onSumbitLesson={async (data) => {
                                let lessonInTable = lessonsTable.find(l => l.slug == activeLesson.slug)
                                if (lessonInTable && lessonInTable.context?.state != 'completed') {
                                    const res = await saveStateLessonFinish(course, activeLesson.slug, data || {})
                                    if (res && res.success) {
                                        showToast.success(`Lesson "${activeLesson.name}" completed!`)
                                    }
                                    let newCourseProgress = res.data
                                    applyNewProgressToCourse(newCourseProgress) 
                                }
                            }}
                        />}

                    </div>}
                </div>
            </div>
        </div>
    </div>
}

export default CourseScreen;