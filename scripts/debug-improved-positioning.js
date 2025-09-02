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

async function debugImprovedPositioning() {
  console.log('🎯 Debugging Improved Positioning...\n');
  
  try {
    // Load the empty certificate template
    const templatePath = path.join(__dirname, '..', 'cert', 'certificate_empty.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    console.log(`📏 PDF dimensions: ${width} x ${height} points`);
    console.log(`📏 PDF height: ${(height / 72 * 2.54).toFixed(2)} cm`);

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Calculate conversion factor
    const pdfHeightCm = 21.01; // Actual PDF height in cm
    const conversionFactor = height / pdfHeightCm; // 19.85 points per cm
    
    // Improved positioning (Y inverted - from top measurements)
    const centerX = width / 2;
    const userNameY = height - (10.5 * conversionFactor); // 10.5 cm from top
    const pathNameY = height - (13.5 * conversionFactor); // 13.5 cm from top
    const issueDateY = height - (14.2 * conversionFactor); // 14.2 cm from top
    const issueDateXShift = 1 * conversionFactor; // 1 cm shift to the right

    console.log('\n📍 Improved positioning:');
    console.log(`👤 User Name: (${centerX}, ${userNameY.toFixed(2)}) - 10.5 cm from top`);
    console.log(`📚 Path Name: (${centerX}, ${pathNameY.toFixed(2)}) - 13.5 cm from top`);
    console.log(`📅 Issue Date: (${centerX + issueDateXShift}, ${issueDateY.toFixed(2)}) - 14.2 cm from top + 1cm right shift`);

    // Add visual markers to verify positioning
    page.drawLine({
      start: { x: 0, y: userNameY },
      end: { x: width, y: userNameY },
      thickness: 3,
      color: rgb(1, 0, 0), // Red line
    });

    page.drawLine({
      start: { x: 0, y: pathNameY },
      end: { x: width, y: pathNameY },
      thickness: 3,
      color: rgb(0, 1, 0), // Green line
    });

    page.drawLine({
      start: { x: 0, y: issueDateY },
      end: { x: width, y: issueDateY },
      thickness: 3,
      color: rgb(0, 0, 1), // Blue line
    });

    // Draw center vertical line
    page.drawLine({
      start: { x: centerX, y: 0 },
      end: { x: centerX, y: height },
      thickness: 2,
      color: rgb(0.5, 0.5, 0.5), // Gray line
    });

    // Draw shifted center line for date
    page.drawLine({
      start: { x: centerX + issueDateXShift, y: 0 },
      end: { x: centerX + issueDateXShift, y: height },
      thickness: 2,
      color: rgb(1, 0, 1), // Magenta line for shifted date position
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

    // Add issue date (with X shift to the right)
    const issueDateX = getCenteredX(testData.issueDate, 14, regularFont) + issueDateXShift;
    page.drawText(testData.issueDate, {
      x: issueDateX,
      y: issueDateY,
      size: 14,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add labels for the lines
    page.drawText('USER NAME (10.5cm from top)', {
      x: 10,
      y: userNameY + 8,
      size: 10,
      font: regularFont,
      color: rgb(1, 0, 0),
    });

    page.drawText('PATH NAME (13.5cm from top)', {
      x: 10,
      y: pathNameY + 8,
      size: 10,
      font: regularFont,
      color: rgb(0, 1, 0),
    });

    page.drawText('DATE (14.2cm from top + 1cm right)', {
      x: 10,
      y: issueDateY + 8,
      size: 10,
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

    const fileName = `improved_positioning_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log(`\n✅ Improved positioning test saved to: ${filePath}`);
    console.log(`📊 File size: ${pdfBytes.length} bytes`);
    console.log('\n🎨 Visual markers added:');
    console.log('   🔴 Red line: User name position (10.5 cm from top)');
    console.log('   🟢 Green line: Path name position (13.5 cm from top)');
    console.log('   🔵 Blue line: Issue date position (14.2 cm from top)');
    console.log('   ⚫ Gray line: Center vertical line');
    console.log('   🟣 Magenta line: Shifted center line for date (1 cm right)');

  } catch (error) {
    console.error('❌ Error debugging improved positioning:', error);
    throw error;
  }
}

// Run the debug
debugImprovedPositioning();