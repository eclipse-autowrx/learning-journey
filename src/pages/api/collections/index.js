// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { PATHS } from "@/lib/mock_data/paths";
import { ALL_COURSES } from "@/lib/mock_data/all_courses";
import CourseProgress from "@/lib/models/CourseProgress";
import connectToDatabase from "@/lib/mongodb";
import { check_auth } from "@/lib/backend/check_auth";

let COLLECTIONs = [
    {
        name: 'Theory & Methods',
        description: 'Fundamental theory, key concepts, and methodologies shaping software-defined vehicles',
        paths_slugs: ['sdv-guide-sdv101', 'sdv-guide-sdv102', 'pulse-framework'],
        paths: []
    },
    {
        name: 'Playground',
        description: 'Do quick prototyping on virtual environments',
        paths_slugs: ['playground-onboarding', 'sdv-runtime-getting-started', 'widget-development'],
        paths: []
    },
    {
        name: 'dreamKIT',
        description: 'Bring your ideas to life with dreamKIT',
        paths_slugs: ['dreamkit-getting-started', 'dreampack-getting-started'],
        paths: [],
        titleTag: "dreamkit"
    }
]

COLLECTIONs.forEach(collection => {
  collection.paths = [];
  for (let i = 0; i < collection.paths_slugs.length; i++) {
    const slug = collection.paths_slugs[i];
    const foundPath = PATHS.find(path => path.slug === slug);
    if (foundPath) {
      collection.paths.push(foundPath);
    }
  }
  collection.paths.forEach(path => {
    path.courses = []
    for(let i=0; i< path.course_ids.length; i++) {
      let course = ALL_COURSES.find(c => c._id == path.course_ids[i])
      if(course) {
        path.courses.push(course)
      }
    }
    // path.courses = ALL_COURSES.filter(course => path.course_ids.includes(course._id));
  });
});

const getProgressForCourse = async (user_id, course) => {
  try {
    const dbProgress = await CourseProgress.findOne({ user_id: user_id, course_id: course._id });
    course.progress = dbProgress || {}
  } catch(e) { console.log(e) }
}

export default async function handler(req, res) {
  const { method } = req;

  const { user_id, token } = check_auth(req, res);

  switch (method) {
    case "GET":
      let dbCollections = COLLECTIONs
      if(user_id) {
        await connectToDatabase()

        for(let a=0;a<dbCollections.length;a++) {
          let collection = dbCollections[a]
          if(collection.paths) {
            for(let b=0;b<collection.paths.length;b++) {
              let path = collection.paths[b]
              if(path.courses) {
                for(let c=0;c<path.courses.length;c++) {
                  let course = path.courses[c]
                  // console.log(`getProgressForCourse`, user_id, course._id)
                  await getProgressForCourse(user_id, course)
                  // console.log("progress", course.progress)
                }
              }
            }
          }
        }
      }

      // console.log("RETURN >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

      try {
        res.status(200).json({ success: true, data: dbCollections });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      break;
  }
}
