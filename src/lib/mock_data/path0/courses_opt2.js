import { lessons_overview } from "./lessons_overview.js";
import { lessons_parta } from "./lessons_parta.js";
import { lessons_partb } from "./lessons_partb.js";
import { lessons_partc } from "./lessons_partc.js";
import { lessons_partd } from "./lessons_partd.js";
// Start Generation Here
export const courses_opt2 = [
    {
        _id: "6452a86e7895abcd12345682", // Random MongoDB ObjectId
        name: "Part D: Advanced Topics",
        slug: 'part-d-advanced-topics',
        shortDescription: "Part D: Advanced Topics",
        description: "This course covers advanced topics in Software-Defined Vehicle (SDV) development, including enterprise-level strategies and implementation.",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "notstarted",
        type: "lesson",
        lessons: lessons_partd,
        extends: {
            // external_link: "https://www.sdv.guide/sdv101/part-d-advanced-topics",
        },
    }
];



export const COURSES = [
    {
        _id: "6452a86e7895abcd12345678", // Random MongoDB ObjectId
        name: "Overview",
        shortDescription: "",
        description: "",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "finished",
        type: "lesson",
        lessons: lessons_overview,
        extends: {
            // external_link: "https://www.sdv.guide/sdv101",
        },
    },
    {
        _id: "6452a86e7895abcd12345679", // Random MongoDB ObjectId
        name: "Part A: Essentials",
        slug: 'part-a-essentials',
        shortDescription: "",
        description: "",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "finished",
        type: "lesson",
        lessons: lessons_parta,
        extends: { },
    },
    {
        _id: "6452a86e7895abcd12345680", // Random MongoDB ObjectId
        name: "Part B: Lessons Learned",
        slug: 'part-b-lessons-learned',
        shortDescription: "Part B: Lessons Learned",
        description: "",
        icon_name: "",
        top_icon: "/imgs/icon_book.png",
        state: "inprogress",
        type: "lesson",
        lessons: lessons_partb,
        extends: {
            // external_link: "https://www.sdv.guide/sdv101/part-b-lessons-learned",
        },
    },
    {
        _id: "6452a86e7895abcd12345681", // Random MongoDB ObjectId
        name: "Part C: Building Blocks",
        slug: 'part-c-building-blocks',
        shortDescription: "",
        description: "",
        icon_name: "",
        state: "",
        top_icon: "/imgs/icon_book.png",
        type: "lesson",
        lessons: lessons_partc,
        extends: {
            // external_link: "https://www.sdv.guide/sdv101/part-c-building-blocks",
        },
    },
    {
        _id: "6452a86e7895abcd12345682", // Random MongoDB ObjectId
        name: "Part D: Implementation Strategies",
        shortDescription: "Part D: Implementation Strategies",
        description: "",
        slug: 'part-d-implementation-strategies',
        icon_name: "",
        state: "",
        top_icon: "/imgs/icon_book.png",
        type: "lesson",
        lessons: lessons_partd,
        extends: {
            // external_link: "https://www.sdv.guide/sdv101/part-d-implementation-strategies",
        },
    },
    // {
    //     _id: "6452a86e7895abcd12345683", // Random MongoDB ObjectId
    //     name: "Verify your knowledge",
    //     shortDescription: "Complete the following test to confirm your knowledge and receive your certificate.",
    //     description: "Complete the following test to confirm your knowledge and receive your certificate.",
    //     icon_name: "",
    //     top_icon: "/imgs/icon_question.png",
    //     state: "released",
    //     type: "final-test",
    //     context: {
    //         user_id: 'abc',
    //         state: 'ready'
    //     },
    //     lessons: TEST_A,
    //     extends: {
    //         // external_link: "https://www.sdv.guide/sdv101/part-a-essentials",
    //     },
    // },
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
