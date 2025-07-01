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
                "question": "According to the \"Learnings from the Smart Phone Folks\" document, what event marked the beginning of the true smartphone revolution?",
                "answers": [
                    {
                        "label": "The release of the Apple Newton."
                    },
                    {
                        "label": "The announcement of the iPhone in January 2007.",
                        "is_correct": true
                    },
                    {
                        "label": "The introduction of the Palm Treo."
                    },
                    {
                        "label": "The widespread adoption of BlackBerry devices."
                    }
                ]
            },
            {
                "question": "In the context of APIs and Developer Ecosystems as discussed in \"Learnings from the Smart Phone Folks\", what is the benefit for an app developer creating a feature like a whip sound?",
                "answers": [
                    {
                        "label": "They need to understand the physics behind measuring acceleration."
                    },
                    {
                        "label": "They must have direct access to the phone's internal hardware components."
                    },
                    {
                        "label": "They only need access to an API that provides acceleration data.",
                        "is_correct": true
                    },
                    {
                        "label": "They need to program every low-level sensor interaction themselves."
                    }
                ]
            },
            {
                "question": "What analogy is used in the \"Loose Coupling\" document to describe the challenges of scaling and maintaining complex software systems due to lack of shared language and coordination?",
                "answers": [
                    {
                        "label": "The Bento Box Analogy."
                    },
                    {
                        "label": "The Gordian Knot.",
                        "is_correct": true
                    },
                    {
                        "label": "The Tower of Babel.",
                        "is_correct": true
                    },
                    {
                        "label": "The Amazon Mandate."
                    }
                ]
            },
            {
                "question": "According to the \"Microservices & APIs\" document, what was a key mandate reportedly given by Jeff Bezos to all Amazon teams regarding data and functionality?",
                "answers": [
                    {
                        "label": "All teams must use the same technology for communication."
                    },
                    {
                        "label": "Teams should communicate via direct linking to data stores."
                    },
                    {
                        "label": "All teams must expose their data and functionality through service interfaces.",
                        "is_correct": true
                    },
                    {
                        "label": "Service interfaces are only for internal use and should not be externalized."
                    }
                ]
            },
            {
                "question": "What is the primary function of containers in cloud computing, as described in the \"Containerization\" document?",
                "answers": [
                    {
                        "label": "To run only monolithic applications."
                    },
                    {
                        "label": "To create heavy, interdependent environments."
                    },
                    {
                        "label": "To function as lightweight, isolated environments that package software and its dependencies.",
                        "is_correct": true
                    },
                    {
                        "label": "To manage hardware resources directly without abstraction."
                    }
                ]
            },
            {
                "question": "In the context of \"Building Robust and Resilient Systems\", what tool did Netflix develop to randomly disrupt services in their production environment to ensure reliability?",
                "answers": [
                    {
                        "label": "Chaos Builder."
                    },
                    {
                        "label": "Resilience Tester."
                    },
                    {
                        "label": "Chaos Monkey.",
                        "is_correct": true
                    },
                    {
                        "label": "Service Disruptor."
                    }
                ]
            },
            {
                "question": "Which of the following is NOT a simulated failure introduced by Netflix's proactive approach, as mentioned in \"Building Robust and Resilient Systems\"?",
                "answers": [
                    {
                        "label": "Server failure."
                    },
                    {
                        "label": "Service degradation."
                    },
                    {
                        "label": "Planned system downtime for maintenance.",
                        "is_correct": true
                    },
                    {
                        "label": "Security vulnerabilities."
                    }
                ]
            },
            {
                "question": "According to the \"Cloud Native Principles\" document, what does loose coupling enable?",
                "answers": [
                    {
                        "label": "Tightly integrated systems."
                    },
                    {
                        "label": "Difficult deployment and testing."
                    },
                    {
                        "label": "Rapid deployment, testing, and iteration without disrupting production systems.",
                        "is_correct": true
                    },
                    {
                        "label": "Centralized and inflexible development processes."
                    }
                ]
            },
            {
                "question": "What are the three methodologies that form a powerful toolbox behind the success of modern Internet companies, as mentioned in the \"Innovation Management\" document?",
                "answers": [
                    {
                        "label": "Waterfall, Scrum, and Kanban."
                    },
                    {
                        "label": "Design thinking, lean startup, and agile development.",
                        "is_correct": true
                    },
                    {
                        "label": "Traditional, linear, and iterative approaches."
                    },
                    {
                        "label": "Big Bang, phased, and rapid prototyping."
                    }
                ]
            },
            {
                "question": "The \"Digital-First Paradigm\" introduces two key elements: Shift North and Shift Left. What does \"Shift North\" involve?",
                "answers": [
                    {
                        "label": "Emphasizing early-stage prototyping and simulation."
                    },
                    {
                        "label": "Moving functionality into deeply embedded hardware areas."
                    },
                    {
                        "label": "Moving functionality out of deeply embedded areas and above the hardware abstraction layer.",
                        "is_correct": true
                    },
                    {
                        "label": "Focusing on long-term planning and hardened environments."
                    }
                ]
            }
        ]
    }
]