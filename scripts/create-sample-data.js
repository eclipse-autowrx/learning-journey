#!/usr/bin/env node

// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT



import connectToDatabase from '../src/lib/mongodb.js';
import Course from '../src/lib/models/Course.js';
import Lesson from '../src/lib/models/Lesson.js';


console.log('🎯 Creating Sample Data for Learning Journey');
console.log('============================================\n');

async function createSampleData() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Clear existing sample data
    console.log('🧹 Clearing existing sample data...');
    await Course.deleteMany({ slug: { $regex: /^sample-/ } });
    await Lesson.deleteMany({ slug: { $regex: /^sample-/ } });
    
    console.log('✅ Cleared existing sample data');

    // Create sample lessons
    console.log('\n📚 Creating sample lessons...');
    
    const sampleLessons = [
      {
        name: "Introduction to HTML",
        slug: "sample-intro-html",
        description: "Learn the basics of HTML markup language",
        lesson_type: "video",
        order: 1,
        duration: 45,
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        video_duration: 2700,
        video_provider: "youtube",
        completion_criteria: "view",
        state: "released",
        tags: ["html", "basics", "web"]
      },
      {
        name: "HTML Elements and Tags",
        slug: "sample-html-elements",
        description: "Understanding HTML elements, tags, and attributes",
        lesson_type: "text",
        order: 2,
        duration: 30,
        content: {
          sections: [
            {
              title: "What are HTML Elements?",
              content: "HTML elements are the building blocks of HTML pages..."
            },
            {
              title: "Common HTML Tags",
              content: "Here are some of the most commonly used HTML tags..."
            }
          ]
        },
        completion_criteria: "complete",
        state: "released",
        tags: ["html", "elements", "tags"]
      },
      {
        name: "HTML Quiz",
        slug: "sample-html-quiz",
        description: "Test your knowledge of HTML basics",
        lesson_type: "quiz",
        order: 3,
        duration: 15,
        passing_score: 70,
        max_attempts: 3,
        completion_criteria: "pass_quiz",
        state: "released",
        tags: ["html", "quiz", "assessment"]
      },
      {
        name: "Interactive HTML Playground",
        slug: "sample-html-playground",
        description: "Practice HTML coding in an interactive environment",
        lesson_type: "interactive",
        order: 4,
        duration: 60,
        interactive_config: {
          type: "code_editor",
          language: "html",
          template: "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>"
        },
        completion_criteria: "complete",
        state: "released",
        tags: ["html", "interactive", "practice"]
      },
      {
        name: "Build Your First Webpage",
        slug: "sample-first-webpage",
        description: "Create a complete webpage as an assignment",
        lesson_type: "assignment",
        order: 5,
        duration: 120,
        assignment_instructions: "Create a personal webpage using HTML. Include a header, navigation, main content, and footer.",
        submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        max_points: 100,
        completion_criteria: "submit_assignment",
        state: "released",
        tags: ["html", "assignment", "project"]
      }
    ];

    const createdLessons = await Lesson.insertMany(sampleLessons);
    console.log(`✅ Created ${createdLessons.length} sample lessons`);



    // Create a sample course
    console.log('\n📖 Creating sample course...');
    
    const sampleCourse = {
      name: "Sample HTML Fundamentals",
      slug: "sample-html-fundamentals",
      description: "A comprehensive introduction to HTML basics with hands-on practice",
      lessons: createdLessons.map(lesson => lesson._id),
      lesson_order: createdLessons.map(lesson => lesson._id),
      difficulty: "beginner",
      duration: 4.5, // hours
      total_lessons: createdLessons.length,
      total_duration: createdLessons.reduce((total, lesson) => total + lesson.duration, 0),
      course_type: "standard",
      is_free: true,
      offers_certificate: true,
      learning_objectives: [
        "Understand the basics of HTML markup",
        "Learn to create structured web content",
        "Practice with interactive exercises",
        "Build a complete webpage"
      ],
      skills_covered: ["HTML", "Web Development", "Markup Language"],
      state: "released",
      tags: ["html", "web-development", "beginner"]
    };

    const createdCourse = await Course.create(sampleCourse);
    console.log(`✅ Created sample course: ${createdCourse.name}`);



    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - ${createdLessons.length} lessons created`);

    console.log(`   - 1 course created`);
    console.log('\n🔗 Test URLs:');
    console.log('   - Course: http://localhost:3000/api/courses/sample-html-fundamentals');
    console.log('   - Lessons: http://localhost:3000/api/lessons');


  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();
