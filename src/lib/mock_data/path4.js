// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const PATH4 = {
  _id: "507f1f77bcf86cd799439011",
  name: "dreamKIT getting started",
  description:
    "This path provides a step-by-step guide for getting started with dreamKIT. How to familiar with hardware and how to deploy your first app to the dreamKIT.",
  slug: "dreamkit-getting-started",
  path_type: "standard",
  time_to_complete: 6,
  background_img: "/imgs/green_bg.png",
  image: "/imgs/dreamKit.png",
  thumb: "/imgs/dreamKit.png",
  category: "onboarding",
  tags: ["onboard", "general", "playground", "beginner", "getting-started"],
  valid_from: "2025-01-01T00:00:00.000Z",
  valid_to: "2026-01-01T00:00:00.000Z",
  state: "draft",
  level: "1",
  configs: {
    display_type: "list"
  },
  extends: {
    extraField1: "extraValue1",
  },
  hiddenContent: {
    secret: "hidden-information",
  },
  icon_set: {
    not_started: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
    in_progress: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-learning.png',
    completed: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-done.png',
    locked: 'https://bewebstudio.digitalauto.tech/data/projects/zb1Shh3qkfNG/course-notyet.png',
  },
  course_ids: [
    "3452a86e7895abcd12345678",
    "3452a86e7895abcd12345679",
    "3452a86e7895abcd12345680",
    "3452a86e7895abcd12345681",
    "3452a86e7895abcd12345682",
    "3452a86e7895abcd12345683",
    "3452a86e7895abcd12345684"
  ],
  maps: [
    // {
    //     course_id: "652f3c2e4f1a2b3c4d5e6f7g",
    //     x: "2%",
    //     y: "35.8%"
    // }
  ],
  createdAt: "2024-07-19T14:00:00.000Z",
  updatedAt: "2024-07-19T14:00:00.000Z",
  created_by: "digital.auto",
  num_learners: 14,
  num_certified_learners: 8,
  key_points: [
    {
      title: 'What will I learn?',
      content: ` You will learn how to set up the environment, run the dreamKIT, and use it to develop and test your applications. You will also learn how to install app from marketplace, enable/disable app, and how to use the config dreamKIT via IVI and CLI.`,
    },
    {
      title: 'What do I need to know?',
      content: `You must familiar with the basics of Docker, such as how to run containers. You must know how to use the command line interface (CLI) to run commands and manage files. A solid understanding about Linux OS. You should also have a basic understanding of SDV and its components. Familiarity with Vehicle API, COVESA, Kuksa.`,
    },
    {
      title: 'What do I need?',
      content: `A dreamKIT device with internet connection. A Windows or Linux computer with  internet connection. VSCode or any other code editor.`,
    },
  ]
}