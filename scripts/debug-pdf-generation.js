// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadCertificateConfig, calculatePositions } from '../src/lib/certificate-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugPDFGeneration() {
  console.log('🔍 Debugging PDF Generation...\n');
  
  try {
    // Load configuration
    const config = loadCertificateConfig();
    console.log('✅ Configuration loaded');
    
    // Load the empty certificate template
    const templatePath = path.join(__dirname, '..', 'cert', 'certificate_empty.pdf');
    console.log(`📁 Template path: ${templatePath}`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    const templateBytes = fs.readFileSync(templatePath);
    console.log(`📊 Template size: ${templateBytes.length} bytes`);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();
    
    console.log(`📏 PDF dimensions: ${width} x ${height} points`);
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    console.log('✅ Fonts loaded');
    
    // Calculate positions from configuration
    const positions = calculatePositions(config, height);
    const centerX = width / 2;
    
    console.log('📍 Calculated positions:');
    console.log(`   User name Y: ${positions.userNameY.toFixed(2)} points`);
    console.log(`   Path name Y: ${positions.pathNameY.toFixed(2)} points`);
    console.log(`   Issue date Y: ${positions.issueDateY.toFixed(2)} points`);
    console.log(`   Issue date X shift: ${positions.issueDateXShift.toFixed(2)} points`);
    
    // Helper function to center text
    const getCenteredX = (text, fontSize, font) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      return centerX - (textWidth / 2);
    };
    
    // Test data
    const userName = 'John Doe';
    const pathName = 'Full Stack Web Development';
    const issueDate = 'January 15, 2025';
    
    // Add user name
    const userNameX = getCenteredX(userName, positions.userNameFontSize, font) + positions.userNameXShift;
    page.drawText(userName, {
      x: userNameX,
      y: positions.userNameY,
      size: positions.userNameFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    console.log('✅ User name added');
    
    // Add path name
    const pathNameX = getCenteredX(pathName, positions.pathNameFontSize, regularFont) + positions.pathNameXShift;
    page.drawText(pathName, {
      x: pathNameX,
      y: positions.pathNameY,
      size: positions.pathNameFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Path name added');
    
    // Add issue date
    const issueDateX = getCenteredX(issueDate, positions.issueDateFontSize, regularFont) + positions.issueDateXShift;
    page.drawText(issueDate, {
      x: issueDateX,
      y: positions.issueDateY,
      size: positions.issueDateFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    console.log('✅ Issue date added');
    
    // Save the PDF
    console.log('💾 Saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log(`📊 Generated PDF size: ${pdfBytes.length} bytes`);
    
    // Save to test directory
    const testDir = path.join(__dirname, '..', 'test-certificates');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const fileName = `debug_pdf_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    console.log(`✅ PDF saved to: ${filePath}`);
    
    // Check the file
    const stats = fs.statSync(filePath);
    console.log(`📊 File size: ${stats.size} bytes`);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Check file type
    const { execSync } = await import('child_process');
    try {
      const fileType = execSync(`file "${filePath}"`, { encoding: 'utf8' });
      console.log(`📄 File type: ${fileType.trim()}`);
    } catch (e) {
      console.log('❌ Could not determine file type');
    }
    
    console.log('\n🎉 PDF generation debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    throw error;
  }
}

// Run the debug
debugPDFGeneration();