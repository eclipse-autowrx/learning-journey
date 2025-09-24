// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import { LessonService, CourseService } from '@/lib/services/dataService';
import { check_auth } from '@/lib/backend/check_auth';
import connectToDatabase from '@/lib/mongodb';
import CourseProgress from '@/lib/models/CourseProgress';
import { STATE_COMPLETED, STATE_IN_PROGRESS, STATE_NOT_STARTED } from '@/lib/const';
import { updatePathsForCourse } from '@/pages/api/progress/paths/utils';

const PASSING_SCORE_PERCENTAGE = 80;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { slug } = req.query;
  const { answers } = req.body;

  if (!slug) {
    return res.status(400).json({ success: false, error: 'Lesson slug is required' });
  }

  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: 'Answers must be an array' });
  }

  // Get user authentication
  const { user_id } = check_auth(req, res);
  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    await connectToDatabase();
    
    const lesson = await LessonService.getBySlug(slug);

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    if (lesson.lesson_type !== 'quiz') {
      return res.status(400).json({ success: false, error: 'This lesson is not a quiz' });
    }

    const quizQuestions = lesson.quiz_questions || [];

    if (answers.length !== quizQuestions.length) {
      return res.status(400).json({ success: false, error: 'Number of answers does not match number of questions' });
    }

    let score = 0;
    const detailedResults = answers.map(userAnswer => {
      const question = quizQuestions[userAnswer.question_index];
      if (!question) {
        // Should not happen if lengths are validated, but good for safety
        return {
          question_index: userAnswer.question_index,
          is_correct: false,
          user_answer: userAnswer.answer_index,
        };
      }
      
      const correctAnswerIndex = question.answers.findIndex(a => a.is_correct);
      const isCorrect = userAnswer.answer_index === correctAnswerIndex;
      
      if (isCorrect) {
        score++;
      }

      return {
        question_index: userAnswer.question_index,
        is_correct: isCorrect,
        user_answer: userAnswer.answer_index,
      };
    });

    const scorePercentage = (score / quizQuestions.length) * 100;
    const passed = scorePercentage >= PASSING_SCORE_PERCENTAGE;

    // If quiz is passed, automatically update lesson progress
    if (passed) {
      try {
        // Find the course that contains this lesson
        const course = await CourseService.getByLessonSlug(slug);
        if (course) {
          // Update lesson progress to completed
          const now = new Date();
          const lessonData = {
            state: STATE_COMPLETED,
            updated_at: now,
            finished_at: now,
            data: {
              quiz_results: {
                score,
                total: quizQuestions.length,
                percentage: scorePercentage,
                passed: true
              },
              answers: answers
            },
            records: [{
              at: now,
              action: 'finish_lesson',
              refId: lesson._id.toString(),
              refType: 'quiz',
              data: {
                quiz_results: {
                  score,
                  total: quizQuestions.length,
                  percentage: scorePercentage,
                  passed: true
                },
                answers: answers
              }
            }]
          };

          // Update course progress
          const existingProgress = await CourseProgress.findOne({ user_id, course_id: course._id });
          const setFields = {
            [`lessons.${slug}`]: lessonData
          };

          // Set course as started if not already
          if (!existingProgress || existingProgress.state === STATE_NOT_STARTED) {
            setFields.state = STATE_IN_PROGRESS;
            setFields.started_at = now;
          }

          // Check if all lessons are completed to mark course as completed
          if (course.lessons && course.lessons.length > 0) {
            const allLessonsCompleted = course.lessons.every(lesson => {
              const lessonProgress = existingProgress?.lessons?.get?.(lesson.slug) || existingProgress?.lessons?.[lesson.slug];
              return lessonProgress?.state === STATE_COMPLETED || lesson.slug === slug; // Include current lesson
            });
            
            if (allLessonsCompleted) {
              setFields.state = STATE_COMPLETED;
              setFields.finished_at = now;
            }
          }

          await CourseProgress.findOneAndUpdate(
            { user_id, course_id: course._id },
            { 
              $set: setFields,
              $setOnInsert: { user_id, course_id: course._id }
            },
            { new: true, upsert: true }
          );

          // Update path progress for any paths containing this course
          try {
            await updatePathsForCourse({ user_id, course_id: course._id });
          } catch (pathError) {
            console.error('Error updating path progress:', pathError);
            // Don't fail the quiz submission if path progress update fails
          }
        }
      } catch (progressError) {
        console.error('Error updating lesson progress:', progressError);
        // Don't fail the quiz submission if progress update fails
      }
    }

    return res.status(200).json({
      success: true,
      score,
      total: quizQuestions.length,
      results: detailedResults,
      passed,
      score_percentage: scorePercentage
    });

  } catch (error) {
    console.error(`API Error checking quiz for slug ${slug}:`, error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
