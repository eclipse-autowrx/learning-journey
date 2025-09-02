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

async function debugFontSizes() {
  console.log('🎯 Testing Updated Font Sizes...\n');
  
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

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Calculate conversion factor
    const pdfHeightCm = 21.01; // Actual PDF height in cm
    const conversionFactor = height / pdfHeightCm; // 19.85 points per cm
    
    // Final positioning with updated font sizes
    const centerX = width / 2;
    const userNameY = height - (11 * conversionFactor); // 11 cm from top
    const pathNameY = height - (13.2 * conversionFactor); // 13.2 cm from top
    const issueDateY = height - (14.25 * conversionFactor); // 14.25 cm from top
    const issueDateXShift = 1 * conversionFactor; // 1 cm shift to the right

    // Updated font sizes
    const userNameFontSize = 24 * 1.4; // 140% bigger (33.6)
    const pathNameFontSize = 18 * 1.2; // 120% bigger (21.6)
    const issueDateFontSize = 14; // Keep same

    console.log('\n📍 Final positioning with updated font sizes:');
    console.log(`👤 User Name: (${centerX}, ${userNameY.toFixed(2)}) - Size: ${userNameFontSize} (140% bigger)`);
    console.log(`📚 Path Name: (${centerX}, ${pathNameY.toFixed(2)}) - Size: ${pathNameFontSize} (120% bigger)`);
    console.log(`📅 Issue Date: (${centerX + issueDateXShift}, ${issueDateY.toFixed(2)}) - Size: ${issueDateFontSize} (same)`);

    // Helper function to center text
    const getCenteredX = (text, fontSize, font) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      return centerX - (textWidth / 2);
    };

    // Add user name (larger font)
    const userNameX = getCenteredX(testData.userName, userNameFontSize, font);
    page.drawText(testData.userName, {
      x: userNameX,
      y: userNameY,
      size: userNameFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add path name (larger font)
    const pathNameX = getCenteredX(testData.pathName, pathNameFontSize, regularFont);
    page.drawText(testData.pathName, {
      x: pathNameX,
      y: pathNameY,
      size: pathNameFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add issue date (with X shift to the right)
    const issueDateX = getCenteredX(testData.issueDate, issueDateFontSize, regularFont) + issueDateXShift;
    page.drawText(testData.issueDate, {
      x: issueDateX,
      y: issueDateY,
      size: issueDateFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Save to test directory
    const testDir = path.join(__dirname, '..', 'test-certificates');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const fileName = `updated_font_sizes_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log(`\n✅ Updated font sizes test saved to: ${filePath}`);
    console.log(`📊 File size: ${pdfBytes.length} bytes`);
    console.log('\n🎨 Font size changes:');
    console.log('   👤 User Name: 24pt → 33.6pt (140% bigger)');
    console.log('   📚 Path Name: 18pt → 21.6pt (120% bigger)');
    console.log('   📅 Issue Date: 14pt (unchanged)');
    console.log('\n🎉 Certificate with updated font sizes is ready!');

  } catch (error) {
    console.error('❌ Error testing updated font sizes:', error);
    throw error;
  }
}

// Run the debug
debugFontSizes();