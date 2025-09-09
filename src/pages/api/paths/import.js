// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import dbConnect from '@/lib/mongodb';
import Path from '@/lib/models/Path';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { check_auth } from '@/lib/backend/check_auth';

export const config = {
    api: {
        bodyParser: false,
    },
};

const MEDIA_STORE_PATH = process.env.MEDIA_STORE_PATH
    ? path.join(process.env.MEDIA_STORE_PATH, 'images')
    : path.join(process.cwd(), 'public', 'images');

async function generateUniqueSlug(name, Model) {
    if (!name) return '';
    let baseSlug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await Model.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

const cleanId = (obj) => {
    const newObj = { ...obj };
    delete newObj._id;
    delete newObj.__v;
    delete newObj.created_at;
    delete newObj.updated_at;
    return newObj;
}

const replaceImageUrls = (data, urlMap) => {
    let stringified = JSON.stringify(data);
    Object.entries(urlMap).forEach(([oldUrl, newUrl]) => {
        stringified = stringified.split(oldUrl).join(newUrl);
    });
    return JSON.parse(stringified);
}


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { user_id } = check_auth(req, res);
    if (!user_id) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await dbConnect();
    
    // Ensure media store directory exists
    await fs.mkdir(MEDIA_STORE_PATH, { recursive: true });

    const form = formidable({
        multiples: true,
        uploadDir: MEDIA_STORE_PATH,
        keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ success: false, error: 'Error parsing form data' });
        }
        
        try {
            const rawData = Array.isArray(fields.data) ? fields.data[0] : fields.data;
            const importedData = JSON.parse(typeof rawData === 'string' ? rawData : String(rawData));
            const imageUrlMap = {};

            // Process uploaded files
            for (const oldPath in files) {
                const fileEntry = files[oldPath];
                const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;
                const newFileName = `${Date.now()}_${path.basename(file.filepath)}`;
                const newFilePath = path.join(MEDIA_STORE_PATH, newFileName);
                await fs.rename(file.filepath, newFilePath);
                imageUrlMap[oldPath] = `/images/${newFileName}`;
            }

            const updatedData = replaceImageUrls(importedData, imageUrlMap);
            const { paths } = updatedData;

            let createdCount = { paths: 0, courses: 0, lessons: 0 };

            for (const p of paths) {
                const newPathData = { ...cleanId(p), owner_id: user_id };

                // Handle date fields that might be empty objects
                if (newPathData.valid_from && typeof newPathData.valid_from === 'object' && Object.keys(newPathData.valid_from).length === 0) {
                    newPathData.valid_from = null;
                }
                if (newPathData.valid_to && typeof newPathData.valid_to === 'object' && Object.keys(newPathData.valid_to).length === 0) {
                    newPathData.valid_to = null;
                }

                newPathData.slug = await generateUniqueSlug(newPathData.name, Path);
                
                const importedCourses = newPathData.courses || [];
                newPathData.courses = [];
                newPathData.maps = [];

                const newPath = await Path.create(newPathData);
                createdCount.paths++;

                const newCourseIds = [];
                for (const c of importedCourses) {
                    const newCourseData = { ...cleanId(c), owner_id: user_id };

                    // Handle invalid course_type values
                    const validCourseTypes = ['standard', 'workshop', 'certification', 'mini_course', 'bootcamp'];
                    if (newCourseData.course_type && !validCourseTypes.includes(newCourseData.course_type)) {
                        // Map 'award' to 'certification' as it's the closest match
                        if (newCourseData.course_type === 'award') {
                            newCourseData.course_type = 'certification';
                        } else {
                            // For other invalid types, default to 'standard'
                            newCourseData.course_type = 'standard';
                        }
                    }

                    newCourseData.slug = await generateUniqueSlug(newCourseData.name, Course);
                    
                    const importedLessons = newCourseData.lessons || [];
                    newCourseData.lessons = [];

                    const newCourse = await Course.create(newCourseData);
                    createdCount.courses++;
                    newCourseIds.push(newCourse._id);

                    const originalMapInfo = p.maps?.find(m => m.course_id === c._id);
                    if (originalMapInfo) {
                        newPath.maps.push({
                            course_id: newCourse._id.toString(),
                            x: originalMapInfo.x,
                            y: originalMapInfo.y,
                        });
                    }

                    const newLessonIds = [];
                    for (const l of importedLessons) {
                        const newLessonData = { ...cleanId(l), owner_id: user_id };
                        newLessonData.slug = await generateUniqueSlug(newLessonData.name, Lesson);
                        newLessonData.course_id = newCourse._id;

                        const newLesson = await Lesson.create(newLessonData);
                        createdCount.lessons++;
                        newLessonIds.push(newLesson._id);
                    }
                    
                    newCourse.lessons = newLessonIds;
                    await newCourse.save();
                }

                newPath.courses = newCourseIds;
                await newPath.save();
            }

            res.status(200).json({
                success: true,
                message: `Successfully imported ${createdCount.paths} paths, ${createdCount.courses} courses, and ${createdCount.lessons} lessons.`,
                data: createdCount
            });

        } catch (error) {
            console.error('Error importing data:', error);
            res.status(500).json({ success: false, error: 'Failed to import data' });
        }
    });
}
