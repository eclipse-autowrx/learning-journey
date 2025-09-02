// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data
const testData = {
  userName: 'John Doe',
  pathName: 'Full Stack Web Development',
  issueDate: 'January 15, 2025'
};

async function debugWithMarkers() {
  console.log('🔍 Debugging PDF with Visual Markers...\n');
  
  try {
    // Load the empty certificate template
    const templatePath = path.join(__dirname, '..', 'cert', 'certificate_empty.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    console.log(`📏 PDF dimensions: ${width} x ${height}`);

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const centerX = width / 2;
    
    // Try a more conservative positioning - closer to center
    const positions = {
      userName: { x: centerX, y: height * 0.65, size: 24 },
      pathName: { x: centerX, y: height * 0.55, size: 18 },
      issueDate: { x: centerX, y: height * 0.45, size: 14 }
    };

    console.log('📍 Using conservative positioning:');
    console.log('User Name:', positions.userName);
    console.log('Path Name:', positions.pathName);
    console.log('Issue Date:', positions.issueDate);

    // Add visual markers to help debug positioning
    // Draw horizontal lines at each text position
    page.drawLine({
      start: { x: 0, y: positions.userName.y },
      end: { x: width, y: positions.userName.y },
      thickness: 1,
      color: rgb(1, 0, 0), // Red line
    });

    page.drawLine({
      start: { x: 0, y: positions.pathName.y },
      end: { x: width, y: positions.pathName.y },
      thickness: 1,
      color: rgb(0, 1, 0), // Green line
    });

    page.drawLine({
      start: { x: 0, y: positions.issueDate.y },
      end: { x: width, y: positions.issueDate.y },
      thickness: 1,
      color: rgb(0, 0, 1), // Blue line
    });

    // Draw center vertical line
    page.drawLine({
      start: { x: centerX, y: 0 },
      end: { x: centerX, y: height },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5), // Gray line
    });

    // Helper function to center text
    const getCenteredX = (text, fontSize, font) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      return centerX - (textWidth / 2);
    };

    // Add user name
    const userNameX = getCenteredX(testData.userName, positions.userName.size, font);
    page.drawText(testData.userName, {
      x: userNameX,
      y: positions.userName.y,
      size: positions.userName.size,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add path name
    const pathNameX = getCenteredX(testData.pathName, positions.pathName.size, regularFont);
    page.drawText(testData.pathName, {
      x: pathNameX,
      y: positions.pathName.y,
      size: positions.pathName.size,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add issue date
    const issueDateX = getCenteredX(testData.issueDate, positions.issueDate.size, regularFont);
    page.drawText(testData.issueDate, {
      x: issueDateX,
      y: positions.issueDate.y,
      size: positions.issueDate.size,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add labels for the lines
    page.drawText('USER NAME LINE', {
      x: 10,
      y: positions.userName.y + 5,
      size: 8,
      font: regularFont,
      color: rgb(1, 0, 0),
    });

    page.drawText('PATH NAME LINE', {
      x: 10,
      y: positions.pathName.y + 5,
      size: 8,
      font: regularFont,
      color: rgb(0, 1, 0),
    });

    page.drawText('DATE LINE', {
      x: 10,
      y: positions.issueDate.y + 5,
      size: 8,
      font: regularFont,
      color: rgb(0, 0, 1),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Save to test directory
    const testDir = path.join(__dirname, '..', 'test-certificates');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const fileName = `debug_with_markers_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log(`✅ Debug PDF with markers saved to: ${filePath}`);
    console.log(`📊 File size: ${pdfBytes.length} bytes`);
    console.log('\n🎨 Visual markers added:');
    console.log('   🔴 Red line: User name position');
    console.log('   🟢 Green line: Path name position');
    console.log('   🔵 Blue line: Issue date position');
    console.log('   ⚫ Gray line: Center vertical line');

  } catch (error) {
    console.error('❌ Error debugging PDF with markers:', error);
    throw error;
  }
}

// Run the debug
debugWithMarkers();