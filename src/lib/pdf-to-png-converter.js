// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import pdf from 'pdf-poppler';
import fs from 'fs';
import path from 'path';

/**
 * Convert PDF buffer to PNG buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {Object} options - Conversion options
 * @returns {Promise<Buffer>} PNG buffer
 */
export async function convertPDFToPNG(pdfBuffer, options = {}) {
  try {
    const {
      density = 300, // DPI for high quality
      saveFilename = 'certificate',
      savePath = './temp',
      format = 'png'
    } = options;

    // Ensure temp directory exists
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    // Create temporary PDF file
    const tempPdfPath = path.join(savePath, `${saveFilename}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Configure pdf-poppler options
    const convertOptions = {
      format: format,
      out_dir: savePath,
      out_prefix: saveFilename,
      page: 1, // Convert only first page
      density: density
    };

    // Convert PDF to PNG
    await pdf.convert(tempPdfPath, convertOptions);

    // Read the generated PNG file
    const pngPath = path.join(savePath, `${saveFilename}-1.${format}`);
    const pngBuffer = fs.readFileSync(pngPath);

    // Clean up temporary files
    fs.unlinkSync(tempPdfPath);
    fs.unlinkSync(pngPath);

    return pngBuffer;

  } catch (error) {
    console.error('Error converting PDF to PNG:', error);
    throw new Error(`PDF to PNG conversion failed: ${error.message}`);
  }
}

/**
 * Convert PDF file to PNG file
 * @param {string} pdfPath - Path to PDF file
 * @param {string} pngPath - Path to save PNG file
 * @param {Object} options - Conversion options
 * @returns {Promise<string>} Path to generated PNG file
 */
export async function convertPDFFileToPNG(pdfPath, pngPath, options = {}) {
  try {
    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Convert to PNG
    const pngBuffer = await convertPDFToPNG(pdfBuffer, options);
    
    // Save PNG file
    fs.writeFileSync(pngPath, pngBuffer);
    
    return pngPath;

  } catch (error) {
    console.error('Error converting PDF file to PNG:', error);
    throw new Error(`PDF file to PNG conversion failed: ${error.message}`);
  }
}