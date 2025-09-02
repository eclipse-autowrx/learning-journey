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

async function generatePDFCertificate(userName, pathName, issueDate) {
  console.log('📄 Generating PDF Certificate...');
  
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

    console.log(`📏 PDF dimensions: ${width} x ${height}`);

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Define positions (centered horizontally, calculated from template)
    const centerX = width / 2;
    
    // Calculate conversion factor based on actual PDF height (21.01 cm)
    const pdfHeightCm = 21.01; // Actual PDF height in cm
    const conversionFactor = height / pdfHeightCm; // 19.85 points per cm
    
    // User name position (main text, larger) - final positioning (Y inverted)
    const userNameY = height - (11 * conversionFactor); // 11 cm from top
    const userNameFontSize = 24 * 1.4; // 140% bigger (33.6)
    
    // Path name position (secondary text, medium) - final positioning (Y inverted)
    const pathNameY = height - (13.2 * conversionFactor); // 13.2 cm from top
    const pathNameFontSize = 18 * 1.2; // 120% bigger (21.6)
    
    // Issue date position (smaller text, bottom) - final positioning (Y inverted + X shift)
    const issueDateY = height - (14.25 * conversionFactor); // 14.25 cm from top
    const issueDateFontSize = 14;
    const issueDateXShift = 1 * conversionFactor; // 1 cm shift to the right

    console.log(`📍 Text positions:`);
    console.log(`   User Name: (${centerX}, ${userNameY}) - Size: ${userNameFontSize}`);
    console.log(`   Path Name: (${centerX}, ${pathNameY}) - Size: ${pathNameFontSize}`);
    console.log(`   Issue Date: (${centerX}, ${issueDateY}) - Size: ${issueDateFontSize}`);

    // Helper function to center text
    const getCenteredX = (text, fontSize, font) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      return centerX - (textWidth / 2);
    };

    // Add user name
    const userNameX = getCenteredX(userName, userNameFontSize, font);
    page.drawText(userName, {
      x: userNameX,
      y: userNameY,
      size: userNameFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add path name
    const pathNameX = getCenteredX(pathName, pathNameFontSize, regularFont);
    page.drawText(pathName, {
      x: pathNameX,
      y: pathNameY,
      size: pathNameFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add issue date (with X shift to the right)
    const issueDateX = getCenteredX(issueDate, issueDateFontSize, regularFont) + issueDateXShift;
    page.drawText(issueDate, {
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

    const fileName = `test_pdf_certificate_${userName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log(`✅ PDF certificate saved to: ${filePath}`);
    return filePath;

  } catch (error) {
    console.error('❌ Error generating PDF certificate:', error);
    throw error;
  }
}



async function testCertificateGeneration() {
  console.log('🧪 Testing PDF Certificate Generation (Standalone)...\n');
  console.log('📋 Test Data:');
  console.log(`   User Name: ${testData.userName}`);
  console.log(`   Path Name: ${testData.pathName}`);
  console.log(`   Issue Date: ${testData.issueDate}`);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Test PDF generation only
    const pdfPath = await generatePDFCertificate(
      testData.userName, 
      testData.pathName, 
      testData.issueDate
    );

    console.log('\n🎉 PDF certificate generation test completed successfully!');
    console.log(`📁 PDF: ${pdfPath}`);
    console.log('\n💡 Note: PNG generation removed. Use PDF-to-PNG converter for PNG output.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCertificateGeneration();