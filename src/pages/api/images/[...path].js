// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';

/**
 * API route to serve images from MEDIA_STORE_PATH
 * Next.js standalone mode doesn't properly serve files from symlinked directories,
 * so we use an API route to serve files directly from the volume mount.
 * 
 * Usage: /api/images/filename.png (or /images/filename.png via rewrite)
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const MEDIA_STORE_PATH = process.env.MEDIA_STORE_PATH
        ? path.join(process.env.MEDIA_STORE_PATH, 'images')
        : path.join(process.cwd(), 'public', 'images');

    // Get the file path from the URL
    const filePath = Array.isArray(req.query.path) 
        ? req.query.path.join('/')
        : req.query.path || '';

    if (!filePath) {
        res.status(400).json({ error: 'File path required' });
        return;
    }

    // Construct the full file path
    const fullPath = path.join(MEDIA_STORE_PATH, filePath);

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(fullPath);
    const resolvedMediaPath = path.resolve(MEDIA_STORE_PATH);
    if (!resolvedPath.startsWith(resolvedMediaPath)) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }

    // Check if file exists
    try {
        if (!fs.existsSync(resolvedPath)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        const stats = fs.statSync(resolvedPath);
        if (!stats.isFile()) {
            res.status(404).json({ error: 'Not a file' });
            return;
        }

        // Determine content type based on file extension
        const ext = path.extname(resolvedPath).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Set headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        // Stream the file
        const fileStream = fs.createReadStream(resolvedPath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('[api/images] Error serving file:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
}

