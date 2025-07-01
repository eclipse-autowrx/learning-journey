// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const COURSES = [
    {
        _id: "7452a86e7895abcd12345678", // Random MongoDB ObjectId
        name: "Overview",
        shortDescription: "Overview",
        description: "Overview",
        icon_name: "",
        state: "",
        type: "lesson",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
        extends: {
            external_link: "https://www.sdv.guide/pulse",
        },
    },
    {
        _id: "7452a86e7895abcd12345679", // Random MongoDB ObjectId
        name: "SDV Culture",
        shortDescription: "SDV Culture",
        description: "SDV Culture",
        icon_name: "",
        state: "",
        type: "lesson",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
        extends: {
            external_link: "https://www.sdv.guide/pulse/sdv-culture"
        },
    },
    {
        _id: "7452a86e7895abcd12345680", // Random MongoDB ObjectId
        name: "Lean Sourcing",
        shortDescription: "Lean Sourcing",
        description: "Lean Sourcing",
        icon_name: "",
        state: "",
        type: "lesson",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
        extends: {
            external_link: "https://www.sdv.guide/pulse/lean-sourcing"
        },
    },
    {
        _id: "7452a86e7895abcd12345681", // Random MongoDB ObjectId
        name: "SDV Systems Engineering",
        shortDescription: "SDV Systems Engineering",
        description: "SDV Systems Engineering",
        icon_name: "",
        state: "",
        type: "lesson",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
        extends: {
            external_link: "https://www.sdv.guide/pulse/sdv-systems-engineering",
        },
    },
    {
        _id: "7452a86e7895abcd12345682", // Random MongoDB ObjectId
        name: "Digital First",
        shortDescription: "Digital First",
        description: "Digital First",
        icon_name: "",
        state: "",
        type: "lesson",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
        extends: {
            external_link: "https://www.sdv.guide/pulse/digital-first",
        },
    },
    {
        _id: "7452a86e7895abcd12345698", // Random MongoDB ObjectId
        name: "Verify your knowledge",
        shortDescription: "Verify your knowledge",
        description: "Verify your knowledge",
        icon_name: "",
        state: "",
        type: "final-test",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
        extends: {
            // external_link: "https://www.sdv.guide/sdv101/part-a-essentials",
        },
    },
    {
        _id: "7452a86e7895abcd12345699", // Random MongoDB ObjectId
        name: "Get Certificate",
        shortDescription: "Get your certification and show it off to the world!",
        description: "Congratulations! You have completed the course and are now ready to get your certification.",
        icon_name: "certificate",
        state: "",
        type: "award",
        context: {
            user_id: 'abc',
            state: 'ready'
        },
    }
];
