// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { ALL_COURSES } from "@/lib/mock_data/all_courses";
import { ICONs } from "@/lib/mock_data/media";
import { PATHS } from "@/lib/mock_data/paths";

// import { getProgressForCourses } from "@/pages/api/progress/courses/utils";
import { check_auth } from "@/lib/backend/check_auth";
// import { processCourseContext } from "@/pages/api/progress/courses/utils";

import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";


const ICON_SET = {
  not_started: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
  in_progress: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-learning.png',
  completed: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-done.png',
  locked: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
}

function addMediaUrlForCourses(path) {

  if (!path || !path.courses) return
  let ICONS = path.icon_set || ICON_SET


  path.courses.forEach((course) => {
    if (!course.icon) {
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
    }
  });
}

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;

  const { user_id, token } = check_auth(req, res);
  switch (method) {
    case "GET":
      try {
        let dbPath = PATHS.find((path) => path.slug === slug);
        if (!dbPath) {
          return res
            .status(404)
            .json({ success: false, error: "Path not found" });
        }

        try {
          dbPath.courses = ALL_COURSES.filter((course) =>
            dbPath.course_ids.includes(course._id)
          );

          // if (user_id) {
          //   let progresses = await getProgressForCourses(user_id, dbPath.course_ids)
          //   if (progresses && Array.isArray(progresses)) {
          //     progresses = JSON.parse(JSON.stringify(progresses))
          //     dbPath.courses.forEach((course) => {
          //       const progress = progresses.find(
          //         (p) => p.course_id === course._id
          //       );
          //       // if(!progress) {
          //       //   console.log(`Found no progress for course ${course.name}`)
          //       // }
          //       course.progress = progress || null;

          //       processCourseContext(course)
          //     });
          //   } else {
          //     console.log("Found not progresses")
          //   }
          // } else {
          //   console.log(">>>>> Missing user_id")
          // }

          // addMediaUrlForCourses(dbPath);
          // console.log(`dbCourse`, dbPath.courses)
        } catch (err) {
          console.log(err);
        }

        res.status(200).json({ success: true, data: dbPath });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
