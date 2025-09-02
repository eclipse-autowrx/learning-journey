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

async function testExactPositioning() {
  console.log('🎯 Testing Exact Positioning from Template Measurements...\n');
  
  try {
    // Load the empty certificate template
    const templatePath = path.join(__dirname, '..', 'cert', 'certificate_empty.pdf');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    const templateBytes = fs.readFileSync(templatePath);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    console.log(`📏 PDF dimensions: ${width} x ${height} points`);
    console.log(`📏 Page height: 30 cm = 850.395 points`);

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Exact positioning from your measurements
    const centerX = width / 2;
    const userNameY = 275.53; // 9.72 cm from top
    const pathNameY = 376.72; // 13.29 cm from top
    const issueDateY = 411.59; // 14.52 cm from top

    console.log('\n📍 Exact positioning from template:');
    console.log(`👤 User Name: (${centerX}, ${userNameY}) - 9.72 cm from top`);
    console.log(`📚 Path Name: (${centerX}, ${pathNameY}) - 13.29 cm from top`);
    console.log(`📅 Issue Date: (${centerX}, ${issueDateY}) - 14.52 cm from top`);

    // Add visual markers to verify positioning
    page.drawLine({
      start: { x: 0, y: userNameY },
      end: { x: width, y: userNameY },
      thickness: 2,
      color: rgb(1, 0, 0), // Red line
    });

    page.drawLine({
      start: { x: 0, y: pathNameY },
      end: { x: width, y: pathNameY },
      thickness: 2,
      color: rgb(0, 1, 0), // Green line
    });

    page.drawLine({
      start: { x: 0, y: issueDateY },
      end: { x: width, y: issueDateY },
      thickness: 2,
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
    const userNameX = getCenteredX(testData.userName, 24, font);
    page.drawText(testData.userName, {
      x: userNameX,
      y: userNameY,
      size: 24,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add path name
    const pathNameX = getCenteredX(testData.pathName, 18, regularFont);
    page.drawText(testData.pathName, {
      x: pathNameX,
      y: pathNameY,
      size: 18,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add issue date
    const issueDateX = getCenteredX(testData.issueDate, 14, regularFont);
    page.drawText(testData.issueDate, {
      x: issueDateX,
      y: issueDateY,
      size: 14,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add labels for the lines
    page.drawText('USER NAME (9.72cm)', {
      x: 10,
      y: userNameY + 5,
      size: 8,
      font: regularFont,
      color: rgb(1, 0, 0),
    });

    page.drawText('PATH NAME (13.29cm)', {
      x: 10,
      y: pathNameY + 5,
      size: 8,
      font: regularFont,
      color: rgb(0, 1, 0),
    });

    page.drawText('DATE (14.52cm)', {
      x: 10,
      y: issueDateY + 5,
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

    const fileName = `exact_positioning_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log(`\n✅ Exact positioning test saved to: ${filePath}`);
    console.log(`📊 File size: ${pdfBytes.length} bytes`);
    console.log('\n🎨 Visual markers added:');
    console.log('   🔴 Red line: User name position (9.72 cm)');
    console.log('   🟢 Green line: Path name position (13.29 cm)');
    console.log('   🔵 Blue line: Issue date position (14.52 cm)');
    console.log('   ⚫ Gray line: Center vertical line');

  } catch (error) {
    console.error('❌ Error testing exact positioning:', error);
    throw error;
  }
}

// Run the test
testExactPositioning();