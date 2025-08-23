// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { CourseService } from "@/lib/services/dataService";
import { check_auth } from "@/lib/backend/check_auth";

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
        const course = await CourseService.getBySlug(slug);
        if (!course) return res.status(404).json({ success: false, error: "Course not found" });

        const parseDurationToMinutes = (value) => {
          if (typeof value === 'number' && Number.isFinite(value)) return value;
          if (typeof value !== 'string') return 0;
          const hMatch = value.match(/(\d+)\s*h/);
          const mMatch = value.match(/(\d+)\s*m/);
          // Support formats like "3m09"
          const compactM = value.match(/(\d+)m/);
          const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
          const minutes = mMatch ? parseInt(mMatch[1], 10) : (compactM ? parseInt(compactM[1], 10) : 0);
          return hours * 60 + minutes;
        };

        const normalized = (course.lessons || []).filter(Boolean).map((l) => ({
          _id: l._id || l.slug || `${slug}-${(l.lesson_type || l.type || 'text-markdown')}-${Math.random().toString(36).slice(2,8)}`,
          slug: l.slug,
          name: l.name,
          description: l.description || '',
          lesson_type: l.lesson_type || l.type || 'text-markdown',
          state: l.state || 'draft',
          duration: parseDurationToMinutes(l.duration),
          created_at: l.created_at || new Date(),
          // Carry full content for manage view
          markdown_content: l.markdown_content,
          video_url: l.video_url,
          video_duration: l.video_duration,
          video_provider: l.video_provider,
          quiz_questions: l.quiz_questions || l.questions,
          passing_score: l.passing_score,
          max_attempts: l.max_attempts,
          sequence: l.sequence || l.interactive_config,
        }));

        // Sanitize quiz questions to remove correct answer flags for regular users
        const sanitizedLessons = sanitizeQuizQuestions(normalized, false);

        return res.status(200).json({ success: true, data: sanitizedLessons });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}


