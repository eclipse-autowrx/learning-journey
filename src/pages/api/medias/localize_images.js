// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
const sharp = require('sharp');

const THUMBNAIL_SIZE = Number(process.env.THUMBNAIL_SIZE || '480');
const MAX_IMG_SIZE = Number(process.env.MAX_IMG_SIZE || '1200');

const MEDIA_STORE_PATH = process.env.MEDIA_STORE_PATH || path.join(process.cwd(), 'public', 'images');
const APP_DOMAIN = process.env.APP_DOMAIN || 'http://localhost:3000';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageUrls } = req.body;

        if (!imageUrls || !Array.isArray(imageUrls)) {
            return res.status(400).json({ error: 'imageUrls must be an array' });
        }

        // Ensure media store directory exists
        if (!fs.existsSync(MEDIA_STORE_PATH)) {
            fs.mkdirSync(MEDIA_STORE_PATH, { recursive: true });
        }

        const results = [];
        for (const imageUrl of imageUrls) {
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const originalName = path.basename(new URL(imageUrl).pathname);
                const ext = path.extname(originalName).toLowerCase() || '.png';
                const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

                function slugify(str) {
                    return str
                        .toString()
                        .normalize('NFKD')
                        .replace(/[^a-zA-Z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .toLowerCase();
                }

                const slug = slugify(nameWithoutExt);
                const randomStr = uuidv4().slice(0, 4);
                const uniqueName = `${slug}_${randomStr}${ext}`;
                const destPath = path.join(MEDIA_STORE_PATH, uniqueName);

                let image = sharp(buffer);
                const metadata = await image.metadata();

                if (metadata.width > MAX_IMG_SIZE || metadata.height > MAX_IMG_SIZE) {
                    image = image.resize({
                        width: MAX_IMG_SIZE,
                        height: MAX_IMG_SIZE,
                        fit: 'inside',
                        withoutEnlargement: true,
                    });
                }

                await image.toFile(destPath);

                const thumbName = `${slug}_${randomStr}_thumb.png`;
                const thumbPath = path.join(MEDIA_STORE_PATH, thumbName);

                await sharp(destPath)
                    .resize({
                        width: THUMBNAIL_SIZE,
                        height: THUMBNAIL_SIZE,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .png()
                    .toFile(thumbPath);

                const publicUrl = `/images/${uniqueName}`;
                results.push({ originalUrl: imageUrl, newUrl: publicUrl });
            } catch (error) {
                console.error(`Failed to process image ${imageUrl}:`, error);
                results.push({ originalUrl: imageUrl, error: error.message });
            }
        }

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Failed to process images' });
    }
}

export default handler;
