// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import CourseProgress from "@/lib/models/CourseProgress";


import { STATE_NOT_STARTED, STATE_IN_PROGRESS, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";

export const getProgressForCourse = async (user_id, course_id) => {
    if (!user_id) return
    try {
        console.log(`getProgressForCourse user_id ${user_id}`)
        await connectToDatabase();
        const dbProgress = await CourseProgress.findOne({ user_id: user_id, course_id: course_id });
        return dbProgress
    } catch (err) {
        console.log(err)
        return null
    }
}

export const getProgressForCourses = async (user_id, course_ids) => {
    if (!user_id) return
    try {
        let tmpCourseIds = []
        if (Array.isArray(course_ids)) {
            tmpCourseIds = course_ids;
        } else if (typeof course_ids === "string") {
            tmpCourseIds = course_ids.split(",");
        }

        await connectToDatabase();
        const dbProgresses = (await CourseProgress.find({
            user_id: user_id,
            course_id: { $in: tmpCourseIds }
        }).lean())
        return dbProgresses;
    } catch (err) {
        console.log(err)
        return null
    }
}

export const processCourseContext = async (course) => {
    if (!course) return

    course.context = {
        state: STATE_NOT_STARTED
    }
    if (course.progress) {
        course.context.state = course.progress?.state || STATE_NOT_STARTED

        if (course.lessons) {
            course.lessons.forEach(lesson => {
                lesson.context = {
                    state: STATE_NOT_STARTED
                }

                if (course.progress?.lessons && lesson.slug) {
                    const lessonProgress = course.progress.lessons[lesson.slug]
                    if (lessonProgress) {
                        lesson.context.state = lessonProgress.state || STATE_NOT_STARTED
                    }
                }
            })
        }
    }
}