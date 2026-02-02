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
 * API route to serve files from MEDIA_STORE_PATH/files
 * Usage: /api/files/filename.pdf (or /files/filename.pdf via rewrite)
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    let MEDIA_STORE_PATH;
    if (process.env.MEDIA_STORE_PATH) {
        MEDIA_STORE_PATH = path.join(process.env.MEDIA_STORE_PATH, 'files');
    } else if (process.env.NODE_ENV === 'production') {
        // Production fallback: check /app/data/files (volume mount location)
        MEDIA_STORE_PATH = '/app/data/files';
    } else {
        // Development fallback: use public/files
        MEDIA_STORE_PATH = path.join(process.cwd(), 'public', 'files');
    }

    const filePath = Array.isArray(req.query.path) 
        ? req.query.path.join('/')
        : req.query.path || '';

    if (!filePath) {
        res.status(400).json({ error: 'File path required' });
        return;
    }

    const fullPath = path.join(MEDIA_STORE_PATH, filePath);
    const resolvedPath = path.resolve(fullPath);
    const resolvedMediaPath = path.resolve(MEDIA_STORE_PATH);
    
    if (!resolvedPath.startsWith(resolvedMediaPath)) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }

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

        const ext = path.extname(resolvedPath).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.zip': 'application/zip',
            '.txt': 'text/plain',
            '.json': 'application/json',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        const fileStream = fs.createReadStream(resolvedPath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('[api/files] Error serving file:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
}

