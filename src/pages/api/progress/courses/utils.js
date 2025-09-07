// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { CourseProgress } from "@/lib/models/index.js";


import { STATE_NOT_STARTED, STATE_COMPLETED } from "@/lib/const";

export const getProgressForCourse = async (user_id, course_id) => {
    if (!user_id) return
    try {
        await connectToDatabase();
        const dbProgress = await CourseProgress.findOne({ user_id: user_id, course_id: course_id }).lean();
        return dbProgress
    } catch (err) {
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
            let allCompleted = true;
            course.lessons.forEach(lesson => {
                lesson.context = {
                    state: STATE_NOT_STARTED
                }

                if (course.progress?.lessons && lesson.slug) {
                    let lessonProgress = course.progress.lessons[lesson.slug]
                    if(!lessonProgress && typeof course.progress.lessons.get === 'function') {
                        lessonProgress = course.progress.lessons.get(lesson.slug)
                    }
                    // console.log(`course.progress.lessons`, course.progress.lessons)
                    // console.log(`lessonProgress ${lesson.slug}`, lessonProgress)
                    if (lessonProgress) {
                        lesson.context.state = lessonProgress.state || STATE_NOT_STARTED
                        lesson.context.progress = lessonProgress
                        if (lesson.context.state !== STATE_COMPLETED) {
                            allCompleted = false;
                        }
                    } else {
                        allCompleted = false;
                    }
                }
            })
            // If every lesson is completed, reflect that in course context
            if (allCompleted && course.lessons.length > 0) {
                course.context.state = STATE_COMPLETED;
            }
        }
    }
}