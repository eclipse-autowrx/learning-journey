// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from "@/lib/mongodb";
import { CourseProgress, Course, Lesson } from "@/lib/models/index.js";
import { check_auth } from "@/lib/backend/check_auth";
import { STATE_IN_PROGRESS, STATE_NOT_STARTED, STATE_COMPLETED, STATE_LOCKED } from "@/lib/const";
import { buildNextLessonProgress, isAllRequiredLessonsCompleted, nextCourseStateAfterActivity } from "@/pages/api/progress/courses/helpers";
import { updatePathsForCourse } from "@/pages/api/progress/paths/utils";
// Removed mock data usage; database is the single source of truth

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

                const dbProgress = await CourseProgress.findOne({
                    user_id: user_id,
                    course_id: course_id
                }).lean();

                if (!dbProgress || !dbProgress.lessons) {
                    return res.status(404).json({ success: false, error: "Lesson progress not found" });
                }

                // Support Map or plain object
                const lessons = dbProgress.lessons;
                const lessonProgress = lessons[lesson_slug] || (typeof lessons.get === 'function' ? lessons.get(lesson_slug) : undefined);

                if (!lessonProgress) {
                    return res.status(404).json({ success: false, error: "Lesson progress not found" });
                }

                return res.status(200).json({ success: true, data: lessonProgress });
            } catch (error) {
                return res.status(400).json({ success: false, error: error.message });
            }
            break;
        case "PUT":
            try {
                const updateData = req.body;
                if (!updateData || !updateData.state) {
                    return res.status(400).json({ success: false, error: "Invalid request body, incorrect lesson state" });
                }

                await connectToDatabase();

                // Fetch existing progress doc
                const existingProgress = await CourseProgress.findOne({
                    user_id: user_id,
                    course_id: course_id
                }).lean();

                // Prepare current lesson progress snapshot
                const now = new Date();
                const currentLesson = (existingProgress && existingProgress.lessons && (existingProgress.lessons[lesson_slug] || (typeof existingProgress.lessons.get === 'function' ? existingProgress.lessons.get(lesson_slug) : undefined))) || {
                    state: STATE_NOT_STARTED,
                    started_at: null,
                    finished_at: null,
                    data: {},
                    records: []
                };

                // Transition handling
                const nextLesson = buildNextLessonProgress(currentLesson, updateData.state, updateData.record, now);

                // Guard: disallow regression from completed -> in_progress unless explicitly reopening
                if (currentLesson.state === STATE_COMPLETED && updateData.state === STATE_IN_PROGRESS) {
                    const action = updateData.record?.action || '';
                    if (action.toLowerCase() !== 'reopen_lesson') {
                        return res.status(400).json({ success: false, error: "Cannot regress a completed lesson without 'reopen_lesson' action" });
                    }
                }
                switch (updateData.state) {
                    case STATE_NOT_STARTED:
                        nextLesson.started_at = null;
                        nextLesson.finished_at = null;
                        nextLesson.records = [...(nextLesson.records || []), {
                            at: now,
                            action: updateData.record?.action || 'reset_lesson',
                            refId: updateData.record?.refId || '',
                            refType: updateData.record?.refType || '',
                            data: updateData.record?.data || {}
                        }];
                        break;
                    case STATE_IN_PROGRESS:
                        if (!nextLesson.started_at) {
                            nextLesson.started_at = now;
                        }
                        nextLesson.finished_at = null;
                        nextLesson.records = [...(nextLesson.records || []), {
                            at: now,
                            action: updateData.record?.action || 'start_lesson',
                            refId: updateData.record?.refId || '',
                            refType: updateData.record?.refType || '',
                            data: updateData.record?.data || {}
                        }];
                        break;
                    case STATE_COMPLETED:
                        if (!nextLesson.started_at) {
                            nextLesson.started_at = now;
                        }
                        nextLesson.finished_at = now;
                        nextLesson.records = [...(nextLesson.records || []), {
                            at: now,
                            action: updateData.record?.action || 'finish_lesson',
                            refId: updateData.record?.refId || '',
                            refType: updateData.record?.refType || '',
                            data: updateData.record?.data || {}
                        }];
                        break;
                    default:
                        break;
                }

                // Build $set for atomic update
                const setFields = {};
                setFields[`lessons.${lesson_slug}`] = nextLesson;

                // Ensure course state reflects activity
                let nextCourseState = nextCourseStateAfterActivity(existingProgress?.state, updateData.state);
                let setStartedAt = undefined;
                if (existingProgress?.state === STATE_NOT_STARTED && [STATE_IN_PROGRESS, STATE_COMPLETED].includes(updateData.state)) {
                    setStartedAt = now;
                }

                // Compute course completion using canonical lesson list
                try {
                    const course = await Course.findById(course_id).select('lessons').lean();
                    if (course && Array.isArray(course.lessons) && course.lessons.length > 0) {
                        const lessonsDocs = await Lesson.find({ _id: { $in: course.lessons } }).select('slug').lean();
                        const requiredSlugs = lessonsDocs.map(l => l.slug).filter(Boolean);

                        const allCompleted = isAllRequiredLessonsCompleted(requiredSlugs, existingProgress?.lessons, lesson_slug, nextLesson);

                        if (allCompleted) {
                            nextCourseState = STATE_COMPLETED;
                            setFields['finished_at'] = now;
                        }
                    }
                } catch (_) {
                    // best-effort; do not fail request on course lookup error
                }

                if (nextCourseState !== (existingProgress?.state || STATE_NOT_STARTED)) {
                    setFields['state'] = nextCourseState;
                }
                if (setStartedAt) {
                    setFields['started_at'] = setStartedAt;
                }

                const updatedProgress = await CourseProgress.findOneAndUpdate(
                    { user_id: user_id, course_id: course_id },
                    {
                        $set: setFields,
                        $setOnInsert: { user_id: user_id, course_id: course_id }
                    },
                    { new: true, upsert: true }
                );

                if (!updatedProgress) {
                    return res.status(404).json({ success: false, error: "Lesson progress not found" });
                }

                // fan-out update path progress for any paths containing this course
                try { await updatePathsForCourse({ user_id, course_id }); } catch(_) {}
                return res.status(200).json({ success: true, data: updatedProgress });
            } catch (error) {
                return res.status(400).json({ success: false, error: error.message });
            }
            break;
        default:
            res.status(405).json({ success: false, error: "Method not allowed" });
            break;
    }
}
