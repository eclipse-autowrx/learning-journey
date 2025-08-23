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
      console.log(`BE get course ${slug}`)
      try {
        const dbCourse = await CourseService.getBySlug(slug);
        if (!dbCourse) return res.status(404).json({ success: false, error: "Course not found" });

        // If this is a manage request, enforce ownership
        if (req.query.manage === 'true') {
          if (!user_id) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
          }
          if (dbCourse.owner_id !== user_id) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
          }
        }

        let courseProgress;
        if (user_id) {
          courseProgress = await getProgressForCourse(user_id, dbCourse._id);
        }
        dbCourse.progress = courseProgress;
        await processCourseContext(dbCourse);

        // Check if this is a management request (admin user)
        const isManagementRequest = req.query.manage === 'true' && user_id;
        
        // Sanitize quiz questions to remove correct answer flags for regular users
        if (dbCourse.lessons) {
          dbCourse.lessons = sanitizeQuizQuestions(dbCourse.lessons, isManagementRequest);
        }

        return res.status(200).json({ success: true, data: dbCourse });
      } catch (error) {
        console.log(`Error get course ${slug}`, error)
        return res.status(400).json({ success: false, error: error.message });
      }
    case "PUT":
      try {
        if (!user_id) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        // Verify ownership
        const existing = await CourseService.getBySlug(slug);
        if (!existing) {
          return res.status(404).json({ success: false, error: 'Course not found' });
        }
        if (existing.owner_id !== user_id) {
          return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const updateData = req.body;
        const updatedCourse = await CourseService.updateCourse(slug, updateData);
        if (!updatedCourse) {
          return res.status(404).json({ success: false, error: "Course not found" });
        }
        res.status(200).json({ success: true, data: updatedCourse });
      } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "DELETE":
      try {
        if (!user_id) {
          return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const existing = await CourseService.getBySlug(slug);
        if (!existing) {
          return res.status(404).json({ success: false, error: 'Course not found' });
        }
        if (existing.owner_id !== user_id) {
          return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const deletedCourse = await CourseService.deleteCourse(slug);
        if (!deletedCourse) {
          return res.status(404).json({ success: false, error: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully" });
      } catch (error) {
        console.error('Error deleting course:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}


