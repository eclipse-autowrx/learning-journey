// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT


export const STATE_NOT_STARTED = 'not_started'
export const STATE_IN_PROGRESS = 'in_progress'
export const STATE_COMPLETED = 'completed'
export const STATE_LOCKED = 'locked'

export const COURSE_PROGRESS_STATES = {
    NOT_STARTED: STATE_NOT_STARTED,
    IN_PROGRESS: STATE_IN_PROGRESS,
    COMPLETED: STATE_COMPLETED,
    LOCKED: STATE_LOCKED
};

export const LESSON_PROGRESS_STATES = {
    NOT_STARTED: STATE_NOT_STARTED,
    IN_PROGRESS: STATE_IN_PROGRESS,
    COMPLETED: STATE_COMPLETED
};

// Unified content state options for Collection, Path, Course, Lesson
export const STATE_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'published', label: 'Published' },
  { value: 'locked', label: 'Locked' },
  { value: 'archived', label: 'Archived' }
];

// Backwards-compatible aliases used throughout the app
export const COURSE_STATES = STATE_OPTIONS;
export const COLLECTION_STATES = STATE_OPTIONS;
export const PATH_STATES = STATE_OPTIONS;
export const LESSON_STATES = STATE_OPTIONS;

export const PATH_LEVELS = [
  { value: '1', label: 'Level 1 - Beginner' },
  { value: '2', label: 'Level 2 - Intermediate' },
  { value: '3', label: 'Level 3 - Advanced' },
  { value: '4', label: 'Level 4 - Expert' }
];

export const MEDIA_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document'
};

export const API_ENDPOINTS = {
    AUTH: '/user/auth',
    PROGRESS: {
        COURSES_BULK: '/progress/courses/bulk',
        COURSE: '/progress/courses'
    },
    COLLECTIONS: '/collections',
    PATHS: '/paths',
    COURSES: '/courses',
    LESSONS: '/lessons',
    MEDIA: {
        LIST_ICON: '/medias/list-icon',
        BASE: '/medias'
    }
};
