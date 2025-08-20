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

export const COURSE_STATES = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'released', label: 'Released' },
  { value: 'archived', label: 'Archived' }
];

export const COLLECTION_STATES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

export const PATH_STATES = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'locked', label: 'Locked' },
];

export const LESSON_STATES = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
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
