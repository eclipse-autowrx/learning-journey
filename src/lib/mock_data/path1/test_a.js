// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const LESSONS = [
    {
        slug: 'test_1',
        name: "Test 1",
        description: "This question set evaluates understanding of Software-Defined Vehicles (SDVs) from provided documents. It covers SDV characteristics, development challenges, and safety standards like ASILs.",
        type: "quiz",
        questions: [
            {
                "question": "According to the \"Smart Phone? No: Habitat on Wheels!\" document, what is a key similarity between modern vehicles and smartphones?",
                "answers": [
                    {
                        "label": "They are purely mechanical machines."
                    },
                    {
                        "label": "They primarily use physical buttons for interfaces."
                    },
                    {
                        "label": "They feature touchscreen-centric interfaces and receive over-the-air updates.",
                        "is_correct": true
                    },
                    {
                        "label": "They are judged primarily by horsepower."
                    }
                ]
            },
            {
                "question": "From the customer's perspective, what is a characteristic of a Software-Defined Vehicle (SDV)?",
                "answers": [
                    {
                        "label": "Hardware and software are tightly coupled."
                    },
                    {
                        "label": "It is primarily car-centric."
                    },
                    {
                        "label": "It is connected, personalized, and ever-expanding through updates.",
                        "is_correct": true
                    },
                    {
                        "label": "It focuses on long-term planning and stability."
                    }
                ]
            },
            {
                "question": "What does the term \"functional safety\" mean in automotive software development, according to the \"Challenges: What sets automotive software development apart?\" document?",
                "answers": [
                    {
                        "label": "The absence of unreasonable risk caused by hazards from malfunctioning electric or electronic systems.",
                        "is_correct": true
                    },
                    {
                        "label": "The ability to provide frequent updates and experimental features."
                    },
                    {
                        "label": "The focus on marketing new features to customers."
                    },
                    {
                        "label": "The process of decoupling hardware and software."
                    }
                ]
            },
            {
                "question": "The ISO 26262 standard defines ASILs (Automotive Safety Integrity Levels). Which ASIL level represents the highest safety requirement?",
                "answers": [
                    {
                        "label": "ASIL A"
                    },
                    {
                        "label": "ASIL B"
                    },
                    {
                        "label": "ASIL C"
                    },
                    {
                        "label": "ASIL D",
                        "is_correct": true
                    }
                ]
            },
            {
                "question": "According to the \"MHP: Expert Opinion\" document, what is the core principle of Software-Defined Vehicles (SDVs)?",
                "answers": [
                    {
                        "label": "Shifting from software-defined to hardware-embedded software."
                    },
                    {
                        "label": "Fully decoupling software from hardware, creating an abstraction layer for control and management.",
                        "is_correct": true
                    },
                    {
                        "label": "Relying solely on a distributed architecture with many ECUs."
                    },
                    {
                        "label": "Prioritizing physical attributes over digital performance."
                    }
                ]
            },
            {
                "question": "In the context of SDV E/E-Architecture, what is the modern design aiming to consolidate compute power into?",
                "answers": [
                    {
                        "label": "Only distributed architectures."
                    },
                    {
                        "label": "Zonal or centralized architectures.",
                        "is_correct": true
                    },
                    {
                        "label": "More than 150 ECUs spread across various vehicle zones."
                    },
                    {
                        "label": "Fragmented supplier landscapes."
                    }
                ]
            },
            {
                "question": "Which of the following is considered an ASIL (Automotive Safety Integrity Level) function in the AD/ADAS domain, according to the \"SDV Domains and Two-Speed Delivery\" document?",
                "answers": [
                    {
                        "label": "Camera Display Systems (blind spot monitoring without intervention)."
                    },
                    {
                        "label": "Basic Parking Assist (alerts without intervention)."
                    },
                    {
                        "label": "Lane Keeping Assist.",
                        "is_correct": true
                    },
                    {
                        "label": "Traffic Sign Recognition (display only)."
                    }
                ]
            },
            {
                "question": "In the Motion domain, which of the following is an ASIL function?",
                "answers": [
                    {
                        "label": "Powertrain modes (Eco, Sport)."
                    },
                    {
                        "label": "Suspension settings for comfort."
                    },
                    {
                        "label": "Anti-Lock Braking Systems (ABS).",
                        "is_correct": true
                    },
                    {
                        "label": "Non-critical drivetrain adjustments."
                    }
                ]
            },
            {
                "question": "From the Energy domain, which is classified as an ASIL function?",
                "answers": [
                    {
                        "label": "Battery Charge Level Display."
                    },
                    {
                        "label": "Auxiliary Power Management (infotainment, cabin lighting)."
                    },
                    {
                        "label": "Battery Management Systems (BMS).",
                        "is_correct": true
                    },
                    {
                        "label": "Solar Panel Integration (non-safety systems)."
                    }
                ]
            },
            {
                "question": "In the context of a two-speed delivery model for SDVs, how are QM (Quality Management) systems typically handled?",
                "answers": [
                    {
                        "label": "They require rigorous, slower validation processes."
                    },
                    {
                        "label": "They enable faster iterations and agile development for non-critical features.",
                        "is_correct": true
                    },
                    {
                        "label": "They prioritize long-term planning and hardened environments."
                    },
                    {
                        "label": "They are always combined with ASIL-rated systems without differentiation."
                    }
                ]
            }
        ]
    }
]