// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { loadCertificateConfig, calculatePositions } from './certificate-config.js';

/**
 * Certificate Service - Handles certificate generation and storage
 */
export class CertificateService {
  constructor() {
    this.certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    this.pdfDir = path.join(this.certificatesDir, 'pdf');
    this.pngDir = path.join(this.certificatesDir, 'png');
    this.tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.certificatesDir, this.pdfDir, this.pngDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate certificate for a completed path
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @param {string} pathId - Path ID
   * @param {string} pathName - Path name
   * @param {string} customUserName - Optional custom user name
   * @returns {Object} Certificate links
   */
  async generatePathCertificate(userId, userName, pathId, pathName, customUserName = null) {
    try {
      const displayName = customUserName || userName;
      const issueDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Generate unique filename
      const timestamp = Date.now();
      const safeUserId = userId.replace(/[^a-zA-Z0-9]/g, '_');
      const safePathId = pathId.replace(/[^a-zA-Z0-9]/g, '_');
      const baseFileName = `cert_${safeUserId}_${safePathId}_${timestamp}`;
      
      const pdfFileName = `${baseFileName}.pdf`;
      const pngFileName = `${baseFileName}.png`;
      
      const pdfPath = path.join(this.pdfDir, pdfFileName);
      const pngPath = path.join(this.pngDir, pngFileName);

      // Generate PDF certificate
      const pdfBuffer = await this.generatePDFCertificate(displayName, pathName, issueDate);
      fs.writeFileSync(pdfPath, pdfBuffer);

      // Convert PDF to PNG
      const pngBuffer = await this.convertPDFToPNG(pdfBuffer);
      fs.writeFileSync(pngPath, pngBuffer);

      // Return public URLs
      return {
        pdfUrl: `/certificates/pdf/${pdfFileName}`,
        pngUrl: `/certificates/png/${pngFileName}`,
        fileName: baseFileName
      };

    } catch (error) {
      console.error('Error generating path certificate:', error);
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }

  /**
   * Generate PDF certificate
   * @param {string} userName - User name
   * @param {string} pathName - Path name
   * @param {string} issueDate - Issue date
   * @returns {Buffer} PDF buffer
   */
  async generatePDFCertificate(userName, pathName, issueDate) {
    // Load configuration
    const config = loadCertificateConfig();
    
    // Load the empty certificate template
    const templatePath = path.join(process.cwd(), 'cert', 'certificate_empty.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Calculate positions from configuration
    const positions = calculatePositions(config, height);
    const centerX = width / 2;

    // Helper function to center text
    const getCenteredX = (text, fontSize, font) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      return centerX - (textWidth / 2);
    };

    // Add user name
    const userNameX = getCenteredX(userName, positions.userNameFontSize, font) + positions.userNameXShift;
    page.drawText(userName, {
      x: userNameX,
      y: positions.userNameY,
      size: positions.userNameFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add path name
    const pathNameX = getCenteredX(pathName, positions.pathNameFontSize, regularFont) + positions.pathNameXShift;
    page.drawText(pathName, {
      x: pathNameX,
      y: positions.pathNameY,
      size: positions.pathNameFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add issue date
    const issueDateX = getCenteredX(issueDate, positions.issueDateFontSize, regularFont) + positions.issueDateXShift;
    page.drawText(issueDate, {
      x: issueDateX,
      y: positions.issueDateY,
      size: positions.issueDateFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  /**
   * Convert PDF to PNG
   * @param {Buffer} pdfBuffer - PDF buffer
   * @returns {Buffer} PNG buffer
   */
  async convertPDFToPNG(pdfBuffer) {
    try {
      // Load configuration for PNG settings
      const config = loadCertificateConfig();
      
      // Create a temporary PDF file
      const tempPdfPath = path.join(this.tempDir, `temp_certificate_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      // Use system pdftocairo command to convert PDF to PNG
      const outputBaseName = `temp_certificate_${Date.now()}`;
      
      // Convert PDF to PNG with configurable DPI
      const command = `/opt/homebrew/bin/pdftocairo -png -r ${config.png_dpi} -f 1 -l 1 "${tempPdfPath}" "${path.join(this.tempDir, outputBaseName)}"`;
      execSync(command, { stdio: 'pipe' });

      // Read the generated PNG file (pdftocairo adds -1 to the filename)
      const actualOutputPath = path.join(this.tempDir, `${outputBaseName}-1.png`);
      const pngBuffer = fs.readFileSync(actualOutputPath);

      // Clean up temporary files
      fs.unlinkSync(tempPdfPath);
      fs.unlinkSync(actualOutputPath);

      return pngBuffer;

    } catch (error) {
      console.error('Error converting PDF to PNG:', error);
      throw new Error(`PDF to PNG conversion failed: ${error.message}`);
    }
  }

  /**
   * Delete certificate files
   * @param {string} fileName - Base file name (without extension)
   */
  deleteCertificate(fileName) {
    try {
      const pdfPath = path.join(this.pdfDir, `${fileName}.pdf`);
      const pngPath = path.join(this.pngDir, `${fileName}.png`);
      
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      
      if (fs.existsSync(pngPath)) {
        fs.unlinkSync(pngPath);
      }
    } catch (error) {
      console.error('Error deleting certificate files:', error);
    }
  }
}