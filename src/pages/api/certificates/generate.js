// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { loadCertificateConfig, calculatePositions } from '@/lib/certificate-config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userName, pathName, issueDate, format = 'pdf' } = req.body;

    if (!userName || !pathName || !issueDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userName, pathName, issueDate' 
      });
    }

    // Generate PDF first (always)
    const pdfBuffer = await generatePDFCertificate(userName, pathName, issueDate);

    let result, contentType, fileExtension;
    
    if (format === 'png') {
      // Convert PDF to PNG for consistent results
      result = await convertPDFToPNG(pdfBuffer);
      contentType = 'image/png';
      fileExtension = 'png';
    } else if (format === 'pdf') {
      // Return PDF directly
      result = pdfBuffer;
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid format. Use "pdf" or "png"' 
      });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${userName.replace(/\s+/g, '_')}_${Date.now()}.${fileExtension}"`);
    res.setHeader('Content-Length', result.length);
    res.status(200).end(result);

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate certificate' 
    });
  }
}

async function generatePDFCertificate(userName, pathName, issueDate) {
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
    color: rgb(0, 0, 0), // Black text
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

  // Add issue date (with X shift to the right)
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

async function convertPDFToPNG(pdfBuffer) {
  try {
    // Load configuration for PNG settings
    const config = loadCertificateConfig();
    
    // Create a temporary PDF file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempPdfPath = path.join(tempDir, `temp_certificate_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Use system pdftocairo command (from poppler) to convert PDF to PNG
    const { execSync } = await import('child_process');
    const outputBaseName = `temp_certificate_${Date.now()}`;
    const outputPath = path.join(tempDir, `${outputBaseName}.png`);
    
    // Convert PDF to PNG with configurable DPI
    const command = `pdftocairo -png -r ${config.png_dpi} -f 1 -l 1 "${tempPdfPath}" "${path.join(tempDir, outputBaseName)}"`;
    execSync(command, { stdio: 'pipe' });

    // Read the generated PNG file (pdftocairo adds -1 to the filename)
    const actualOutputPath = path.join(tempDir, `${outputBaseName}-1.png`);
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

