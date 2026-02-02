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

// Lazy load sharp to catch import errors gracefully
let sharp;
let sharpLoadError = null;
try {
    sharp = require('sharp');
} catch (sharpError) {
    sharpLoadError = sharpError;
    console.error('[upload_image] Failed to load sharp module at startup:', sharpError.message);
    // sharp will be undefined, we'll check for it later
}

const THUMBNAIL_SIZE = Number(process.env.THUMBNAIL_SIZE || '480')
const MAX_IMG_SIZE = Number(process.env.MAX_IMG_SIZE || '1200')

export const config = {
    api: {
        bodyParser: false,
    },
};

let MEDIA_STORE_PATH;
if (process.env.MEDIA_STORE_PATH) {
    MEDIA_STORE_PATH = path.join(process.env.MEDIA_STORE_PATH, 'images');
} else if (process.env.NODE_ENV === 'production') {
    // Production fallback: check /app/data/images (volume mount location)
    MEDIA_STORE_PATH = '/app/data/images';
} else {
    // Development fallback: use public/images
    MEDIA_STORE_PATH = path.join(process.cwd(), 'public', 'images');
}

async function handler(req, res) {
    // Ensure we return JSON, not HTML
    res.setHeader('Content-Type', 'application/json');
    
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        // Check if sharp is available
        if (!sharp) {
            console.error('[upload_image] Sharp module not available');
            if (sharpLoadError) {
                console.error('[upload_image] Sharp load error:', sharpLoadError.message);
                console.error('[upload_image] Sharp load error stack:', sharpLoadError.stack);
            }
            res.status(500).json({ 
                error: 'Image processing not available',
                details: process.env.NODE_ENV === 'development' 
                    ? `Sharp module failed to load: ${sharpLoadError?.message || 'Unknown error'}. Try: npm rebuild sharp`
                    : 'Image processing unavailable'
            });
            return;
        }

        // Ensure media store directory exists and is writable
        if (!fs.existsSync(MEDIA_STORE_PATH)) {
            try {
                fs.mkdirSync(MEDIA_STORE_PATH, { recursive: true });
                console.log(`[upload_image] Created media store directory: ${MEDIA_STORE_PATH}`);
            } catch (mkdirErr) {
                console.error('[upload_image] Failed to create media store directory:', mkdirErr);
                res.status(500).json({ error: 'Failed to create media directory' });
                return;
            }
        }
        
        // Check if directory is writable
        try {
            await fs.promises.access(MEDIA_STORE_PATH, fs.constants.W_OK);
        } catch (accessErr) {
            console.error('[upload_image] Media store directory is not writable:', accessErr);
            res.status(500).json({ error: 'Media directory is not writable' });
            return;
        }

        // Ensure temp upload directory exists BEFORE parsing, since formidable writes files there
        const TMP_DIR = path.join(process.cwd(), '.tmp_uploads');
        try {
            if (!fs.existsSync(TMP_DIR)) {
                fs.mkdirSync(TMP_DIR, { recursive: true });
                console.log(`[upload_image] Created temp directory: ${TMP_DIR}`);
            }
        } catch (tmpInitErr) {
            console.error('[upload_image] Failed to init temp dir:', tmpInitErr);
            res.status(500).json({ error: 'Failed to initialize temp directory' });
            return;
        }

        const form = formidable({
            multiples: false,
            // Always stream to a temp directory to avoid locking in the final destination on Windows
            uploadDir: TMP_DIR,
            keepExtensions: true,
        });

        form.parse(req, async (err, _, files) => {
            try {
                if (err) {
                    console.error('[upload_image] formidable error:', err);
                    console.error('[upload_image] formidable error stack:', err.stack);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Error parsing the file', details: err?.message });
                    }
                    return;
                }

                let file = files.image || files.file || Object.values(files)[0];
                if (Array.isArray(file)) {
                    file = file[0]
                }
                if (!file) {
                    console.error('[upload_image] No file found in parsed form-data');
                    if (!res.headersSent) {
                        res.status(400).json({ error: 'No file uploaded' });
                    }
                    return;
                }

                const ext = path.extname(file.originalFilename || '').toLowerCase();
                const allowedImageExts = ['.png', '.jpg', '.jpeg', '.webp'];
                const isImageFile = allowedImageExts.includes(ext);

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
                    // For Windows compatibility, always use copy+unlink instead of rename
                    const fromPath = file.filepath || file.path;
                    if (!fromPath) {
                        console.error('[upload_image] Missing temp path from formidable file object');
                        if (!res.headersSent) {
                            res.status(400).json({ error: 'Invalid upload: missing temp file path' });
                        }
                        return;
                    }
                    try {
                        await fs.promises.copyFile(fromPath, destPath);
                        // Clean up temp file
                        try {
                            await fs.promises.unlink(fromPath);
                        } catch (unlinkErr) {
                            console.warn('[upload_image] Could not delete temp file:', unlinkErr.message);
                        }
                    } catch (copyErr) {
                        console.error('[upload_image] Failed to copy file:', copyErr);
                        console.error('[upload_image] Copy error stack:', copyErr.stack);
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Failed to save file' });
                        }
                        return;
                    }

                    let publicUrl = `/images/${uniqueName}`;
                    let publicThumbUrl = null;

                    if (isImageFile) {
                        // Process as image file
                        // Read the image
                        let image;
                        try {
                            image = sharp(destPath);
                        } catch (e) {
                            console.error('[upload_image] Unable to read image:', e);
                            if (!res.headersSent) {
                                res.status(415).json({ error: 'Unable to read image' });
                            }
                            return;
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
                                    console.warn('[upload_image] Could not delete temp resized file:', cleanupErr.message);
                                }
                            } catch (resizeErr) {
                                console.error('[upload_image] Failed to save resized image:', resizeErr);
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
                            
                            publicThumbUrl = `/images/${thumbName}`;
                        } catch (thumbErr) {
                            console.error('[upload_image] Failed to create thumbnail:', thumbErr);
                            console.error('[upload_image] Thumbnail error stack:', thumbErr.stack);
                            // Continue without thumbnail if creation fails
                        }
                    } else {
                        // Handle as normal file - no image processing, use same URL for both image and thumbnail
                        publicThumbUrl = publicUrl;
                    }

                    if (!res.headersSent) {
                        res.status(200).json({
                            success: true,
                            url: publicUrl,
                            filename: uniqueName,
                            thumbnail: publicThumbUrl,
                        });
                    }
                } catch (moveErr) {
                    // Clean up any files that might have been created
                    try {
                        if (fs.existsSync(destPath)) {
                            await fs.promises.unlink(destPath);
                        }
                    } catch (cleanupErr) {
                        console.warn('[upload_image] Could not cleanup destination file:', cleanupErr.message);
                    }
                    
                    console.error('[upload_image] Error processing file:', moveErr);
                    console.error('[upload_image] Move error stack:', moveErr.stack);
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
        } catch (parseError) {
            console.error('[upload_image] Unexpected error in form.parse callback:', parseError);
            console.error('[upload_image] Error stack:', parseError.stack);
            if (!res.headersSent) {
                res.status(500).json({ 
                    error: 'Unexpected error processing upload',
                    details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
                });
            }
        }
    });
    } catch (handlerError) {
        console.error('[upload_image] Handler error:', handlerError);
        console.error('[upload_image] Handler error stack:', handlerError.stack);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? handlerError.message : undefined
            });
        }
    }
}

export default handler;
