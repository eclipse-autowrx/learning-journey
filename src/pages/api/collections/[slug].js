// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import connectToDatabase from '../../../lib/mongodb.js';
import { Collection } from '../../../lib/models/index.js';
import { check_auth } from '../../../lib/backend/check_auth.js';

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

// Recursive function to sanitize quiz questions throughout the collection structure
function sanitizeCollectionData(collection, isManagementRequest = false) {
  if (!collection) return collection;
  
  // Ensure we are working with a plain object, not a Mongoose document
  const sanitizedCollection = (typeof collection.toObject === 'function')
    ? collection.toObject()
    : { ...collection };
  
  // Sanitize paths
  if (sanitizedCollection.paths && Array.isArray(sanitizedCollection.paths)) {
    sanitizedCollection.paths = sanitizedCollection.paths.map(path => {
      const sanitizedPath = { ...path };
      
      // Sanitize courses within paths
      if (sanitizedPath.courses && Array.isArray(sanitizedPath.courses)) {
        sanitizedPath.courses = sanitizedPath.courses.map(course => {
          const sanitizedCourse = { ...course };
          
          // Sanitize lessons within courses
          if (sanitizedCourse.lessons && Array.isArray(sanitizedCourse.lessons)) {
            sanitizedCourse.lessons = sanitizeQuizQuestions(sanitizedCourse.lessons, isManagementRequest);
          }
          
          return sanitizedCourse;
        });
      }
      
      return sanitizedPath;
    });
  }
  
  return sanitizedCollection;
}

export default async function handler(req, res) {
  const { method, query } = req;
  const { slug } = query;
  const { user_id, token } = check_auth(req, res);

  await connectToDatabase();

  switch (method) {
    case "GET":
      try {
        const collection = await Collection.findOne({ slug })
          .populate({
            path: 'paths',
            populate: {
              path: 'courses',
              populate: {
                path: 'lessons'
              }
            }
          });

        if (!collection) {
          return res.status(404).json({ 
            success: false, 
            error: 'Collection not found' 
          });
        }

        // Always sanitize for learners
        const isManagementRequest = false;
        
        // Sanitize quiz questions to remove correct answer flags for regular users
        const sanitizedCollection = sanitizeCollectionData(collection, isManagementRequest);

        const transformedCollection = {
          _id: sanitizedCollection._id,
          name: sanitizedCollection.name,
          slug: sanitizedCollection.slug,
          description: sanitizedCollection.description,
          category: sanitizedCollection.category,
          tags: sanitizedCollection.tags,
          paths: sanitizedCollection.paths || [],
          path_order: sanitizedCollection.path_order || [],
          total_paths: sanitizedCollection.paths ? sanitizedCollection.paths.length : 0,
          state: sanitizedCollection.state,
          valid_from: sanitizedCollection.valid_from,
          valid_to: sanitizedCollection.valid_to,
          configs: sanitizedCollection.configs,
          extends: sanitizedCollection.extends,
          hiddenContent: sanitizedCollection.hiddenContent,
          meta_title: sanitizedCollection.meta_title,
          meta_description: sanitizedCollection.meta_description,
          accessibility_notes: sanitizedCollection.accessibility_notes,
          created_at: sanitizedCollection.createdAt,
          updated_at: sanitizedCollection.updatedAt
        };

        res.status(200).json({ success: true, data: transformedCollection });
      } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    // No PUT/DELETE in learner endpoint
 
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed. Use /api/creator/collections for management.`
      });
  }
} 