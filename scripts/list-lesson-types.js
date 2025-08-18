// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../src/lib/mongodb.js'
import Lesson from '../src/lib/models/Lesson.js'

async function main() {
  try {
    await connectToDatabase()
    const distinctLessonType = await Lesson.distinct('lesson_type')
    const distinctType = await Lesson.distinct('type')
    const counts = await Lesson.aggregate([
      { $group: { _id: { $ifNull: ['$lesson_type', '$type'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    console.log(JSON.stringify({ lesson_type: distinctLessonType, type: distinctType, counts }, null, 2))
  } catch (e) {
    console.error('Error listing lesson types:', e?.message || e)
    process.exitCode = 1
  } finally {
    process.exit()
  }
}

main()


