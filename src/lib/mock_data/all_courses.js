// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { COURSES as path5_courses } from "@/lib/mock_data/path5/courses.js" 
import { COURSES as path3a_courses } from "@/lib/mock_data/path3a/courses.js" 
import { COURSES as path3_courses } from "@/lib/mock_data/path3/courses.js" 
import { COURSES as path2_5_courses } from "@/lib/mock_data/path2.5/courses.js" 
import { COURSES as path2_courses } from "@/lib/mock_data/path2/courses.js" 
import { COURSES as path1b_courses } from "@/lib/mock_data/path1b/courses.js"
import { COURSES as path1_courses } from "@/lib/mock_data/path1/courses.js"
// import { COURSES as path0_courses } from "@/lib/mock_data/path0/courses.js"
import { COURSES as path0_courses } from "@/lib/mock_data/path0/courses_opt2.js"

const processCourse = (course) => {
    course.forEach(c => {

        c.created_at = c.created_at || new Date("2023-01-01")
        c.updated_at = c.updated_at || new Date("2023-06-07")
        c.lessons = c.lessons || []
        c.created_by = c.created_by || "John Doe"
        c.num_learners = c.num_learners || 0
        c.num_certified_learners = c.num_certified_learners || 0
        c.context = { }
        c.lessons = c.lessons || []
        c.hiddenContent = c.hiddenContent || {}
        c.course_type = c.course_type || "standard"
        c.tags = c.tags || []
        c.extends = c.extends || {}
        c.configs = c.configs || {}
        c.image = c.image || "/imgs/sdv101.jpg"
        c.thumb = c.thumb || ''
        c.category = c.category || ''
        c.icon = c.icon || ''
        c.icon_name = c.icon_name || ''
        c.state = c.state || ''
        c.duration = c.duration || "4 hrs"
        c.difficulty = c.difficulty || "beginner"
        c.valid_from = c.valid_from || new Date("2023-01-01")
        c.valid_to = c.valid_to || new Date("2026-12-31")
        c.slug = c.slug || c.name.toLowerCase().replace(/ /g, "-")
    })
}

processCourse(path0_courses)
processCourse(path1_courses)
processCourse(path2_courses)
processCourse(path2_5_courses)
processCourse(path3_courses)
processCourse(path3a_courses)
processCourse(path5_courses)

export const ALL_COURSES = [
    ...path0_courses, 
    ...path1_courses, 
    ...path1b_courses,
    ...path2_courses, 
    ...path2_5_courses, 
    ...path3_courses, 
    ...path3a_courses,
    ...path5_courses
]
