// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { welcome_lessons } from "./welcome_lesson"
import { explorer_lessons } from './explore_prototype'

export const COURSES = [
    {
        _id: "652f3c2e4f1a2b3c4d5e6f7c", // Random MongoDB ObjectId
        name: "Welcome to the playground",
        shortDescription: "Playground overview, concept, purpose and target audience.",
        description: "Provide a brief overview of the playground and its purpose. This course is designed to help you understand the basics of the playground and how to navigate through it.",
        icon_name: "",
        state: "finished",
        type: "lesson",
        lessons: welcome_lessons,
        context: { },
    },
    {
        _id: "652f3c2e4f1a2b3c4d5e6f8b", // Random MongoDB ObjectId
        name: "Explore existing prototypes",
        shortDescription: "This course provides a walkthrough of existing demos.",
        description: "Via various demos, you will learn how to use the playground and its features.",
        icon_name: "",
        state: "finished",
        type: "lesson",
        lessons: explorer_lessons,
        context: { }
    },
    {
        _id: "652f3c2e4f1a2b3c4d5e6f9a", // Random MongoDB ObjectId
        name: "Register and login",
        shortDescription: "This course teaches you how to register and login.",
        description: "In this course you will learn how to register and login to the playground. You will also learn how to manage your profile.",
        icon_name: "",
        state: "finished",
        type: "lesson",
        lessons: [],
        context: {  },
    },
    {
        _id: "507f1f77bcf86cd799439011", // Random MongoDB ObjectId
        name: "Vehicle Model and Vehicle API",
        shortDescription: "This course teaches you how to create a vehicle model.",
        description: "In this course your will learn how to create a vehicle model using the playground. You will learn about the different components of a vehicle model and how to use them effectively.",
        icon_name: "",
        state: "finished",
        type: "lesson",
        lessons: [],
        context: { },
    },
    {
        _id: "507f1f77bcf86cd799439012", // Random MongoDB ObjectId
        name: "Create your first prototype",
        shortDescription: "This course teaches you how to create a simple prototype.",
        description: "In this course you will learn how to create a prototype using the playground. You will learn about the different components of a prototype and how to use them effectively.",
        icon_name: "",
        type: "lesson",
        lessons: [],
        state: "inprogress",
        context: { },
    },
    {
        _id: "507f1f77bcf86cd799439013", // Random MongoDB ObjectId
        name: "Create and manage wishlist API",
        shortDescription: "This course teaches you how to create and manage your own API.",
        description: "In this course you will learn how to create and manage your own API using the playground. You will learn about the different components of an API and how to use them effectively.",
        icon_name: "",
        type: "lesson",
        lessons: [],
        state: "",
        context: { },
    },
    {
        _id: "507f1f77bcf86cd799439014", // Random MongoDB ObjectId
        name: "Collect Vehicle API Badge",
        shortDescription: "You are now ready to get your Vehicle API badge.",
        description: "Collect your Vehicle API badge and show it off to the world!",
        icon_name: "",
        top_icon: "/imgs/badge/badge_rocket.png",
        type: "award",
        lessons: [],
        state: "",
        context: { },
    },
    {
        _id: "507f1f77bcf86cd799439015", // Random MongoDB ObjectId
        name: "Design dashboard and run prototype",
        shortDescription: "Build dashboard to present your idea and execute the demo.",
        description: "In this course you will learn how to design a dashboard and run the demo. You will learn about the different components of a dashboard and how to use them effectively.",
        icon_name: "",
        state: "",
        lessons: [],
        type: "lesson",
        context: { },
    },
    {
        _id: "537f1f77bcf86cd799439016", // Random MongoDB ObjectId
        name: "Challenge - Create passenger welcome prototype",
        shortDescription: "Create a prototype to get certificate",
        description: "Create a prototype to get certificate",
        icon_name: "",
        top_icon: "/imgs/badge/practice.png",
        state: "",
        lessons: [],
        type: "final-test",
        context: { },
    },
    {
        _id: "507f1f77bcf86cd799439016", // Random MongoDB ObjectId
        name: "Get Certificate",
        shortDescription: "Get your certification and show it off to the world!",
        description: "Congratulations! You have completed the course and are now ready to get your certification.",
        icon_name: "",
        top_icon: "/imgs/badge/quality-badge.png",
        state: "",
        type: "award",
        lessons: [],
        context: { },
    }
];
