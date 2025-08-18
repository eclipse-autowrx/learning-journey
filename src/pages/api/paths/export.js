// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import JSZip from 'jszip';
import dbConnect from '@/lib/mongodb';
import Path from '@/lib/models/Path';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

async function getFileContent(filePath) {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    const content = await fs.readFile(fullPath);
    return content;
  } catch (error) {
    console.warn(`Could not read file: ${filePath}`, error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await dbConnect();

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'Path IDs are required' });
  }

  try {
    const zip = new JSZip();
    const exportData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      paths: [],
    };

    const pathObjectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const paths = await Path.find({ _id: { $in: pathObjectIds } }).lean();

    // console.log('paths', paths);

    for (const p of paths) {
      const courseObjectIds = p.courses || [];

      const courses = await Course.find({ _id: { $in: courseObjectIds } }).lean();
      
      const imagePathsToInclude = new Set();
      if (p.image) imagePathsToInclude.add(p.image);
      if (p.background_img) imagePathsToInclude.add(p.background_img);
      if (p.thumb) imagePathsToInclude.add(p.thumb);

      const enrichedCourses = [];
      for (const c of courses) {
        // console.log('course', c);
        const lessonObjectIds = c.lessons || [];
        const lessons = await Lesson.find({ _id: { $in: lessonObjectIds } }).lean();
        // const lessons = await Lesson.find({ course_id: c._id }).lean();
        enrichedCourses.push({ ...c, lessons });
        
        if (c.image) imagePathsToInclude.add(c.image);
        if (c.thumb) imagePathsToInclude.add(c.thumb);
      }
      
      const pathData = { ...p, courses: enrichedCourses };
      exportData.paths.push(pathData);
      
      for (const imgPath of imagePathsToInclude) {
        if (!imgPath) continue;
        const fileContent = await getFileContent(imgPath);
        if (fileContent) {
          const zipImagePath = `images${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
          zip.file(zipImagePath, fileContent);
        }
      }
    }

    zip.file('data.json', JSON.stringify(exportData, null, 2));

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="learning-journey-export-${new Date().toISOString()}.zip"`);
    res.status(200).send(zipContent);

  } catch (error) {
    console.error('Error exporting paths:', error);
    res.status(500).json({ success: false, error: 'Failed to export paths' });
  }
}
