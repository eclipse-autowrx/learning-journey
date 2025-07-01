// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
const sharp = require('sharp');

const THUMBNAIL_SIZE = process.env.THUMBNAIL_SIZE || '480'
const MAX_IMG_SIZE = Number(process.env.MAX_IMG_SIZE || '1200')

export const config = {
    api: {
        bodyParser: false,
    },
};

const MEDIA_STORE_PATH = (process.env.MEDIA_STORE_PATH || '/tmp/media_store') + '/images';
const APP_DOMAIN = process.env.APP_DOMAIN || 'http://localhost:3000';

async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Ensure media store directory exists
    if (!fs.existsSync(MEDIA_STORE_PATH)) {
        fs.mkdirSync(MEDIA_STORE_PATH, { recursive: true });
    }

    const form = formidable({
        multiples: false,
        uploadDir: MEDIA_STORE_PATH,
        keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: 'Error parsing the file' });
            return;
        }

        let file = files.image || files.file || Object.values(files)[0];
        if (Array.isArray(file)) {
            file = file[0]
        }
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }


        const ext = path.extname(file.originalFilename || '');

        // Helper function to slugify the original filename (without extension)
        function slugify(str) {
            return str
                .toString()
                .normalize('NFKD') // normalize unicode
                .replace(/[\u0300-\u036F]/g, '') // remove diacritics
                .replace(/[^a-zA-Z0-9]+/g, '-') // replace non-alphanumeric with hyphens
                .replace(/^-+|-+$/g, '') // trim hyphens from start/end
                .toLowerCase();
        }

        const originalName = file.originalFilename || file.name || 'file';
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const slug = slugify(nameWithoutExt);
        const randomStr = Math.random().toString(36).slice(2, 5);
        const uniqueName = `${slug}_${randomStr}${ext}`;
        const destPath = path.join(MEDIA_STORE_PATH, uniqueName);

        try {
            // Move file to destination
            console.log('file.filepath', file.filepath);
            console.log('file.path', file.path);
            await fs.promises.rename(file.filepath || file.path, destPath);

            // INSERT_YOUR_CODE



            // Read the image
            const image = sharp(destPath);

            // Get metadata to check size
            const metadata = await image.metadata();

            // If image is larger than 1200 in width or height, resize it
            if (metadata.width > MAX_IMG_SIZE || metadata.height > MAX_IMG_SIZE) {
                await image
                    .resize({
                        width: MAX_IMG_SIZE,
                        height: MAX_IMG_SIZE,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .toFile(destPath + '.tmp');

                // Replace the original file with the resized one
                await fs.promises.rename(destPath + '.tmp', destPath);
            }

            // Create a thumbnail (max 480x480)
            const thumbName = `${slug}_${randomStr}_thumb${ext}`;
            const thumbPath = path.join(MEDIA_STORE_PATH, thumbName);

            await sharp(destPath)
                .resize({
                    width: THUMBNAIL_SIZE,
                    height: THUMBNAIL_SIZE,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFile(thumbPath);

            // Construct public URL (assuming /images/ is mapped to MEDIA_STORE_PATH)
            const publicUrl = `/images/${uniqueName}`;
            const publicThumbUrl = `/images/${thumbName}`;

            res.status(200).json({
                success: true,
                url: publicUrl,
                filename: uniqueName,
                thumbnail: publicThumbUrl,
            });
        } catch (moveErr) {
            console.log('moveErr', moveErr);
            res.status(500).json({ error: 'Failed to save file' });
        }
    });
}

export default handler;
