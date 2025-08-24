// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PathService, CourseService } from "@/lib/services/dataService";
import { ICONs } from "@/lib/mock_data/media";
import { check_auth } from "@/lib/backend/check_auth";
import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";
import { CourseProgress } from "@/lib/models/index.js";

const ICON_SET = {
  not_started: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
  in_progress: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-learning.png',
  completed: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-done.png',
  locked: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
}

function addMediaUrlForCourses(path) {
  if (!path || !Array.isArray(path.courses)) return;
  const ICONS = path.icon_set || ICON_SET;
  path.courses = path.courses.filter(Boolean);
  path.courses.forEach((course) => {
    if (!course) return;
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
        console.log(` PathService.getBySlugslug`, slug)
        const dbPath = await PathService.getBySlug(slug);
        if (!dbPath) { 
          console.log(` PathService.getBySlug not found`, slug)
          return res.status(404).json({ success: false, error: "Path not found" });
        }

        try {
          // Normalize and populate courses
          const hasCoursesArray = Array.isArray(dbPath.courses) && dbPath.courses.length > 0;
          if (hasCoursesArray) {
            const first = dbPath.courses[0];
            const looksPopulated = first && typeof first === 'object' && !!first.name;
            if (!looksPopulated) {
              const ids = dbPath.courses;
              dbPath.courses = await CourseService.getCoursesByPath({ courses: ids });
            }
            
            if (user_id) {
              console.log("User ID found, fetching progress:", user_id);
              const courseIds = dbPath.courses.map(c => c._id);
              console.log("Fetching progress for course IDs:", courseIds);
              const progresses = await CourseProgress.find({ user_id: user_id, course_id: { $in: courseIds } });
              console.log("Fetched progresses:", JSON.stringify(progresses, null, 2));
              dbPath.courses.forEach(course => {
                const progress = progresses.find(p => p.course_id.toString() === course._id.toString());
                if (progress) {
                  console.log(`Match found for course ${course._id}:`, JSON.stringify(progress, null, 2));
                  course.context = {
                    state: progress.state,
                    progress: progress
                  };
                }
              });
            }
          }

          // If courses are missing, leave as empty array
          if (!hasCoursesArray || !dbPath.courses || dbPath.courses.length === 0) {
            dbPath.courses = [];
          }

          addMediaUrlForCourses(dbPath);
        } catch (err) {
          console.log('Error processing courses:', err);
        }

        res.status(200).json({ success: true, data: dbPath });
      } catch (error) {
        console.error('Error fetching path:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ success: false, error: 'Method not allowed. Use /api/creator/paths for management.' });
      break;
  }
}
