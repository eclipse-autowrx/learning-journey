// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

const course_states = [
    "not_started",
    "in_progress",
    "completed"
];

let course_progress = {
    _id: 'ObjectId',
    user_id: 'ObjectId',
    course_id: 'ObjectId',
    state: "not_started",
    updated_at: Date,
    started_at: Date,
    finished_at: Date,
    data: {},
    lessons: {
        lesson_id: {
            state: "not_started",
            updated_at: Date,
            started_at: Date,
            finished_at: Date,
            data: {},
            records: [
                {
                    at: Date,
                    action: "",
                    refId: "",
                    refType: ""
                }
            ]
        }
    }
}