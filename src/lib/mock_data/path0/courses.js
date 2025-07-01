// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import {LESSONS as TEST_A } from "./test_a"
import {LESSONS as TEST_B } from "./test_b"
import {LESSONS as TEST_C } from "./test_c"
import {LESSONS as TEST_D } from "./test_d"

export const COURSES = [
    {
        _id: "6452a86e7895abcd12345678", // Random MongoDB ObjectId
        name: "Overview",
        shortDescription: "Overview",
        description: "Overview",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "finished",
        type: "lesson",
        extends: {
            external_link: "https://www.sdv.guide/sdv101",
        },
    },
    {
        _id: "6452a86e7895abcd12345679", // Random MongoDB ObjectId
        name: "Part A: Essentials",
        shortDescription: "Part A: Essentials",
        description: "Part A: Essentials",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "finished",
        type: "lesson",
        extends: {
            external_link: "https://www.sdv.guide/sdv101/part-a-essentials",
        },
    },
    {
        _id: "6452a86e7895abcd12345677", // Random MongoDB ObjectId
        name: "Quiz A",
        shortDescription: "Complete the following test to confirm your knowledge and receive your certificate.",
        description: "Complete the following test to confirm your knowledge and receive your certificate.",
        icon_name: "",
        top_icon: "/imgs/icon_question.png",
        state: "released",
        type: "test",
        lessons: TEST_A,
        extends: { },
    },
    {
        _id: "6452a86e7895abcd12345680", // Random MongoDB ObjectId
        name: "Part B: Lessons Learned",
        shortDescription: "Part B: Lessons Learned",
        description: "Part B: Lessons Learned",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "inprogress",
        type: "lesson",
        extends: {
            external_link: "https://www.sdv.guide/sdv101/part-b-lessons-learned",
        },
    },
    {
        _id: "6452a86e7895abcd12345685", // Random MongoDB ObjectId
        name: "Quiz B",
        shortDescription: "Complete the following test to confirm your knowledge and receive your certificate.",
        description: "Complete the following test to confirm your knowledge and receive your certificate.",
        icon_name: "",
        top_icon: "/imgs/icon_question.png",
        state: "released",
        type: "test",
        lessons: TEST_B,
        extends: { },
    },
    {
        _id: "6452a86e7895abcd12345681", // Random MongoDB ObjectId
        name: "Part C: Building Blocks",
        shortDescription: "Part C: Building Blocks",
        description: "Part C: Building Blocks",
        icon_name: "",
        state: "",
        top_icon: "/imgs/icon_book.png",
        type: "lesson",
        extends: {
            external_link: "https://www.sdv.guide/sdv101/part-c-building-blocks",
        },
    },
    {
        _id: "6452a86e7895abcd12345686", // Random MongoDB ObjectId
        name: "Quiz C",
        shortDescription: "Complete the following test to confirm your knowledge and receive your certificate.",
        description: "Complete the following test to confirm your knowledge and receive your certificate.",
        icon_name: "",
        top_icon: "/imgs/icon_question.png",
        state: "released",
        type: "test",
        lessons: TEST_C,
        extends: { },
    },
    {
        _id: "6452a86e7895abcd12345682", // Random MongoDB ObjectId
        name: "Part D: Implementation Strategies",
        shortDescription: "Part D: Implementation Strategies",
        description: "Part D: Implementation Strategies",
        icon_name: "",
        state: "",
        top_icon: "/imgs/icon_book.png",
        type: "lesson",
        extends: {
            external_link: "https://www.sdv.guide/sdv101/part-d-implementation-strategies",
        },
    },
    {
        _id: "6452a86e7895abcd12345683", // Random MongoDB ObjectId
        name: "Quiz D",
        shortDescription: "Complete the following test to confirm your knowledge and receive your certificate.",
        description: "Complete the following test to confirm your knowledge and receive your certificate.",
        icon_name: "",
        top_icon: "/imgs/icon_question.png",
        state: "released",
        type: "test",
        lessons: TEST_D,
        extends: { },
    },
    {
        _id: "6452a86e7895abcd12345684", // Random MongoDB ObjectId
        name: "Certificate",
        shortDescription: "Get your certification and show it off to the world!",
        description: "Congratulations! You have completed the course and are now ready to get your certification.",
        icon_name: "",
        top_icon: "/imgs/badge/quality-badge.png",
        image: "/imgs/cert/cert_101_introduction.png",
        state: "",
        type: "award",
        context: {
            user_id: 'abc',
            state: 'finished'
        },
    }
];
