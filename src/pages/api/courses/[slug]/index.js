// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import { CourseService } from "@/lib/services/dataService";
import { getProgressForCourse } from "@/pages/api/progress/courses/utils";
import { check_auth } from "@/lib/backend/check_auth";
import { processCourseContext } from "@/pages/api/progress/courses/utils";

// Function to sanitize quiz questions by removing correct answer flags
// Only sanitize for regular users, preserve for admin/management requests
function sanitizeQuizQuestions(lessons, isManagementRequest = false) {
  if (!lessons || !Array.isArray(lessons)) return lessons;
  
  // If this is a management request, don't sanitize (preserve is_correct flags)
  if (isManagementRequest) return lessons;
  
  return lessons.map(lesson => {
    if (lesson.lesson_type === 'quiz' && lesson.quiz_questions) {
      const sanitizedLesson = { ...lesson };
      sanitizedLesson.quiz_questions = lesson.quiz_questions.map(question => ({
        ...question,
        answers: question.answers?.map(answer => ({
          label: answer.label,
          // Remove is_correct flag for regular users - only backend should know correct answers
          // is_correct: answer.is_correct // This line is intentionally removed for security
        }))
      }));
      return sanitizedLesson;
    }
    return lesson;
  });
}

export default async function handler(req, res) {
  const { method } = req;
  const { slug } = req.query;
  const { user_id } = check_auth(req, res);

  switch (method) {
    case "GET":
      try {
        const dbCourse = await CourseService.getBySlug(slug);
        if (!dbCourse) return res.status(404).json({ success: false, error: "Course not found" });

        let courseProgress;
        if (user_id) {
          courseProgress = await getProgressForCourse(user_id, dbCourse._id);
        }
        if (courseProgress) {
          // Attach progress at root for downstream processing
          dbCourse.progress = courseProgress;
          // Also mirror into context for clients expecting it there
          dbCourse.context = {
            ...(dbCourse.context || {}),
            state: courseProgress.state,
            progress: courseProgress
          };
        }
        await processCourseContext(dbCourse);

        // Sanitize quiz questions to remove correct answer flags for regular users
        if (dbCourse.lessons) {
          dbCourse.lessons = sanitizeQuizQuestions(dbCourse.lessons, false);
        }

        return res.status(200).json({ success: true, data: dbCourse });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, error: 'Method not allowed. Use /api/creator/courses for management.' });
  }
}


