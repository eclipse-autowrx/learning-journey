// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import CourseProgress from "@/lib/models/CourseProgress";
import { check_auth } from "@/lib/backend/check_auth";
import { STATE_IN_PROGRESS, STATE_NOT_STARTED, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";
import { ALL_COURSES } from "@/lib/mock_data/all_courses";

export default async function handler(req, res) {
    const { method } = req;
    const { course_id, lesson_slug } = req.query;

    const { user_id, token } = check_auth(req, res);

    if (!user_id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    if (!course_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, error: "Invalid course ID format" });
    }

    switch (method) {
        case "GET":
            try {

                await connectToDatabase();

                return res.status(501).json({
                    success: false,
                    error: "This method is not implemented yet"
                });

                const dbProgress = await LessonProgress.findOne({
                    user_id: user_id,
                    course_id: course_id
                });

                if (!dbProgress) {
                    return res.status(404).json({ success: false, error: "Lesson progress not found" });
                }

                res.status(200).json({ success: true, data: dbProgress });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        case "PUT":
            try {
                const updateData = req.body;
                if (!updateData || !updateData.state) {
                    return res.status(400).json({ success: false, error: "Invalid request body, incorrect lesson state" });
                }

                await connectToDatabase();

                let existingProgress = await CourseProgress.findOne({
                    user_id: user_id,
                    course_id: course_id
                });

                if (!existingProgress) {
                    existingProgress = {
                        user_id: user_id,
                        course_id: course_id,
                        state: STATE_IN_PROGRESS
                    };
                }

                let existLesson
                if (!existingProgress.lessons) {
                    existingProgress.lessons = new Map()
                } else {
                    existLesson = existingProgress.lessons.get(lesson_slug)
                }

                if (!existLesson) {
                    existLesson = {
                        state: STATE_NOT_STARTED,
                        finished_at: null,
                        data: {},
                        records: []
                    }
                }
                existLesson.state = updateData.state
                existLesson.updated_at = new Date()

                switch (updateData.state) {
                    case STATE_NOT_STARTED:
                        existLesson.started_at = null;
                        existLesson.finished_at = null;
                        existLesson.records.push({
                            at: new Date(),
                            action: updateData.record?.action || "Withdraw lesson",
                            refId: updateData.record?.refId || '',
                            refType: updateData.record?.refType || '',
                            data: updateData.record?.data || {}
                        })
                        break;
                    case STATE_IN_PROGRESS:
                        if (!existLesson.started_at) {
                            existLesson.started_at = new Date();
                        }
                        existLesson.finished_at = null;
                        existLesson.records.push({
                            at: new Date(),
                            action: updateData.record?.action || "Do learning",
                            refId: updateData.record?.refId || '',
                            refType: updateData.record?.refType || '',
                            data: updateData.record?.data || {}
                        })
                        break;
                    case STATE_COMPLETED:
                        if (!existLesson.started_at) {
                            existLesson.started_at = new Date();
                        }
                        existLesson.finished_at = new Date();
                        existLesson.records.push({
                            at: new Date(),
                            action: updateData.record?.action || "Finish lesson",
                            refId: updateData.record?.refId || '',
                            refType: updateData.record?.refType || '',
                            data: updateData.record?.data || {}
                        })

                        // for this course, check that is all lesson finished
                        if (existingProgress.state != STATE_COMPLETED) {
                            let dbCourse = ALL_COURSES.find((course) => course._id === course_id);
                            if (dbCourse) {
                                let allLessonsCompleted = true;
                                for (const lesson of dbCourse.lessons) {
                                    if (lesson.slug != lesson_slug) {
                                        const lessonProgress = existingProgress.lessons.get(lesson.slug);
                                        if (!lessonProgress || lessonProgress.state !== STATE_COMPLETED) {
                                            allLessonsCompleted = false;
                                            break;
                                        }
                                    }
                                }
                                if (allLessonsCompleted) {
                                    existingProgress.state = STATE_COMPLETED;
                                    existingProgress.finished_at = new Date();
                                }
                            }
                        }

                        break;
                    default:
                        break;
                }

                existingProgress.lessons.set(lesson_slug, existLesson)

                // when I do start or finish lesson, make sure auto set course to started
                if ([STATE_IN_PROGRESS, STATE_COMPLETED].includes(updateData.state)) {
                    if (existingProgress.state == STATE_NOT_STARTED) {
                        existingProgress.state = STATE_IN_PROGRESS
                        existingProgress.started_at = new Date()
                    }
                }

                // console.log(`existingProgress`, existingProgress)



                const updatedProgress = await CourseProgress.findOneAndUpdate(
                    { user_id: user_id, course_id: course_id },
                    existingProgress,
                    { new: true, upsert: true }
                );

                if (!updatedProgress) {
                    return res.status(404).json({ success: false, error: "Lesson progress not found" });
                }

                res.status(200).json({ success: true, data: updatedProgress });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        default:
            res.status(405).json({ success: false, error: "Method not allowed" });
            break;
    }
}
