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

const THUMBNAIL_SIZE = Number(process.env.THUMBNAIL_SIZE || '480')
const MAX_IMG_SIZE = Number(process.env.MAX_IMG_SIZE || '1200')

export const config = {
    api: {
        bodyParser: false,
    },
};

const MEDIA_STORE_PATH = path.join(process.cwd(), 'public', 'images');

async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Basic request diagnostics
    try {
        console.log('[upload_image] request start', {
            method: req.method,
            url: req.url,
            contentType: req.headers['content-type'],
        });
        console.log('[upload_image] config', {
            MEDIA_STORE_PATH,
            TMP_DIR: path.join(process.cwd(), '.tmp_uploads'),
            THUMBNAIL_SIZE,
            MAX_IMG_SIZE,
        });
    } catch (_) {}

    // Ensure media store directory exists and is writable
    if (!fs.existsSync(MEDIA_STORE_PATH)) {
        try {
            fs.mkdirSync(MEDIA_STORE_PATH, { recursive: true });
        } catch (mkdirErr) {
            console.error('Failed to create media store directory:', mkdirErr);
            res.status(500).json({ error: 'Failed to create media directory' });
            return;
        }
    }
    
    // Check if directory is writable
    try {
        await fs.promises.access(MEDIA_STORE_PATH, fs.constants.W_OK);
    } catch (accessErr) {
        console.error('Media store directory is not writable:', accessErr);
        res.status(500).json({ error: 'Media directory is not writable' });
        return;
    }

    // Ensure temp upload directory exists BEFORE parsing, since formidable writes files there
    const TMP_DIR = path.join(process.cwd(), '.tmp_uploads');
    try {
        if (!fs.existsSync(TMP_DIR)) {
            fs.mkdirSync(TMP_DIR, { recursive: true });
        }
    } catch (tmpInitErr) {
        console.error('[upload_image] Failed to init temp dir:', tmpInitErr);
        return res.status(500).json({ error: 'Failed to initialize temp directory' });
    }

    const form = formidable({
        multiples: false,
        // Always stream to a temp directory to avoid locking in the final destination on Windows
        uploadDir: TMP_DIR,
        keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
        console.log('[upload_image] formidable.parse callback');
        if (err) {
            console.error('[upload_image] formidable error:', err);
            res.status(500).json({ error: 'Error parsing the file', details: err?.message });
            return;
        }

        try {
            console.log('[upload_image] fields =', fields);
            const fileKeys = Object.keys(files || {});
            console.log('[upload_image] files keys =', fileKeys);
            for (const key of fileKeys) {
                const val = files[key];
                const f = Array.isArray(val) ? val[0] : val;
                console.log(`[upload_image] file[${key}]`, {
                    originalFilename: f?.originalFilename || f?.name,
                    filepath: f?.filepath,
                    path: f?.path,
                    size: f?.size,
                    mimetype: f?.mimetype,
                });
            }
        } catch (_) {}

        let file = files.image || files.file || Object.values(files)[0];
        if (Array.isArray(file)) {
            file = file[0]
        }
        if (!file) {
            console.error('[upload_image] No file found in parsed form-data');
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }


        const ext = path.extname(file.originalFilename || '').toLowerCase();
        const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
        if (!allowedExts.includes(ext)) {
            res.status(400).json({ error: 'Unsupported file type' });
            return;
        }

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
        // Ensure temp dir exists
        const TMP_DIR = path.join(process.cwd(), '.tmp_uploads');
        if (!fs.existsSync(TMP_DIR)) {
            try {
                fs.mkdirSync(TMP_DIR, { recursive: true });
            } catch (tmpMkdirErr) {
                console.error('Failed to create temp directory:', tmpMkdirErr);
                res.status(500).json({ error: 'Failed to create temp directory' });
                return;
            }
        }
        const destPath = path.join(MEDIA_STORE_PATH, uniqueName);

        try {
            // Move file to destination
            console.log('file.filepath', file.filepath);
            console.log('file.path', file.path);
            
            // For Windows compatibility, always use copy+unlink instead of rename
            const fromPath = file.filepath || file.path;
            if (!fromPath) {
                console.error('[upload_image] Missing temp path from formidable file object');
                return res.status(400).json({ error: 'Invalid upload: missing temp file path' });
            }
            try {
                await fs.promises.copyFile(fromPath, destPath);
                // Clean up temp file
                try { 
                    await fs.promises.unlink(fromPath); 
                } catch (unlinkErr) {
                    console.log('Warning: Could not delete temp file:', unlinkErr.message);
                }
            } catch (copyErr) {
                console.error('Failed to copy file:', copyErr);
                return res.status(500).json({ error: 'Failed to save file' });
            }

            // INSERT_YOUR_CODE

            // Read the image
            let image;
            try {
                image = sharp(destPath);
            } catch (e) {
                return res.status(415).json({ error: 'Unable to read image' });
            }

            // Get metadata to check size
            const metadata = await image.metadata();

            // If image is larger than 1200 in width or height, resize it
            if (metadata.width > MAX_IMG_SIZE || metadata.height > MAX_IMG_SIZE) {
                const resizedBuffer = await image
                    .resize({
                        width: MAX_IMG_SIZE,
                        height: MAX_IMG_SIZE,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .toBuffer();

                // Create a temporary file for the resized image to avoid Windows file lock issues
                const tempResizedPath = path.join(process.cwd(), '.tmp_uploads', `resized_${uniqueName}`);
                try {
                    // Write resized image to temp file first
                    await fs.promises.writeFile(tempResizedPath, resizedBuffer);
                    
                    // Then replace the original file atomically
                    await fs.promises.copyFile(tempResizedPath, destPath);
                    
                    // Clean up temp resized file
                    try {
                        await fs.promises.unlink(tempResizedPath);
                    } catch (cleanupErr) {
                        console.log('Warning: Could not delete temp resized file:', cleanupErr.message);
                    }
                } catch (resizeErr) {
                    console.error('Failed to save resized image:', resizeErr);
                    // Continue with original image if resize fails
                }
            }

            // Create a thumbnail (max 480x480)
            const thumbName = `${slug}_${randomStr}_thumb.png`;
            const thumbPath = path.join(MEDIA_STORE_PATH, thumbName);

            try {
                await sharp(destPath)
                    .resize({
                        width: THUMBNAIL_SIZE,
                        height: THUMBNAIL_SIZE,
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .png()
                    .toFile(thumbPath);
            } catch (thumbErr) {
                console.error('Failed to create thumbnail:', thumbErr);
                // Continue without thumbnail if creation fails
            }

            // Construct public URL (assuming /images/ is mapped to MEDIA_STORE_PATH)
            const publicUrl = `/images/${uniqueName}`;
            const publicThumbUrl = thumbPath ? `/images/${thumbName}` : null;

            if (!res.headersSent) {
                res.status(200).json({
                    success: true,
                    url: publicUrl,
                    filename: uniqueName,
                    thumbnail: publicThumbUrl,
                });
            }
        } catch (moveErr) {
            console.log('moveErr', moveErr);
            
            // Clean up any files that might have been created
            try {
                if (fs.existsSync(destPath)) {
                    await fs.promises.unlink(destPath);
                }
            } catch (cleanupErr) {
                console.log('Warning: Could not cleanup destination file:', cleanupErr.message);
            }
            
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'Failed to save file',
                    details: process.env.NODE_ENV === 'development' ? moveErr.message : undefined
                });
            }
        }

        // Fallback: ensure a response is always sent to avoid stalled requests while debugging
        if (!res.headersSent) {
            console.error('[upload_image] Fallback: no response sent, returning 500');
            res.status(500).json({ error: 'Unexpected error: no response sent' });
        }
    });
}

export default handler;
