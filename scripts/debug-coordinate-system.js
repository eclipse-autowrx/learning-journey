// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugCoordinateSystem() {
  console.log('🔍 Debugging PDF Coordinate System...\n');
  
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
    console.log(`📏 Width: ${width} points = ${(width / 72).toFixed(2)} inches = ${(width / 72 * 2.54).toFixed(2)} cm`);
    console.log(`📏 Height: ${height} points = ${(height / 72).toFixed(2)} inches = ${(height / 72 * 2.54).toFixed(2)} cm`);
    
    // Your measurements
    const pageHeightCm = 30;
    const userNameYCm = 9.72;
    const courseNameYCm = 13.29;
    const dateYCm = 14.52;
    
    console.log('\n📐 Your measurements:');
    console.log(`📄 Page height: ${pageHeightCm} cm`);
    console.log(`👤 User name: ${userNameYCm} cm from top`);
    console.log(`📚 Course name: ${courseNameYCm} cm from top`);
    console.log(`📅 Date: ${dateYCm} cm from top`);
    
    // Calculate conversion factor
    const conversionFactor = height / pageHeightCm;
    console.log(`\n🔄 Conversion factor: ${conversionFactor.toFixed(2)} points per cm`);
    
    // Calculate positions using the conversion factor
    const userNameY = userNameYCm * conversionFactor;
    const courseNameY = courseNameYCm * conversionFactor;
    const dateY = dateYCm * conversionFactor;
    
    console.log('\n📍 Calculated positions:');
    console.log(`👤 User Name Y: ${userNameY.toFixed(2)} points`);
    console.log(`📚 Course Name Y: ${courseNameY.toFixed(2)} points`);
    console.log(`📅 Date Y: ${dateY.toFixed(2)} points`);
    
    // Test with different approaches
    console.log('\n🧪 Testing different positioning approaches...');
    
    // Approach 1: Direct cm to points conversion (28.3465 points per cm)
    const cmToPoints = 28.3465;
    const userNameY1 = userNameYCm * cmToPoints;
    const courseNameY1 = courseNameYCm * cmToPoints;
    const dateY1 = dateYCm * cmToPoints;
    
    console.log('\n📍 Approach 1 (28.3465 points/cm):');
    console.log(`👤 User Name Y: ${userNameY1.toFixed(2)} points`);
    console.log(`📚 Course Name Y: ${courseNameY1.toFixed(2)} points`);
    console.log(`📅 Date Y: ${dateY1.toFixed(2)} points`);
    
    // Approach 2: Using page height ratio
    const userNameY2 = (userNameYCm / pageHeightCm) * height;
    const courseNameY2 = (courseNameYCm / pageHeightCm) * height;
    const dateY2 = (dateYCm / pageHeightCm) * height;
    
    console.log('\n📍 Approach 2 (page height ratio):');
    console.log(`👤 User Name Y: ${userNameY2.toFixed(2)} points`);
    console.log(`📚 Course Name Y: ${courseNameY2.toFixed(2)} points`);
    console.log(`📅 Date Y: ${dateY2.toFixed(2)} points`);
    
    // Create test PDF with all approaches
    const testDoc = await PDFDocument.load(templateBytes);
    const testPages = testDoc.getPages();
    const testPage = testPages[0];
    
    const font = await testDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await testDoc.embedFont(StandardFonts.Helvetica);
    
    const centerX = width / 2;
    
    // Add markers for all approaches
    const approaches = [
      { name: 'Approach 1', userNameY: userNameY1, courseNameY: courseNameY1, dateY: dateY1, color: rgb(1, 0, 0) },
      { name: 'Approach 2', userNameY: userNameY2, courseNameY: courseNameY2, dateY: dateY2, color: rgb(0, 1, 0) }
    ];
    
    approaches.forEach((approach, index) => {
      // Draw horizontal lines
      testPage.drawLine({
        start: { x: 0, y: approach.userNameY },
        end: { x: width, y: approach.userNameY },
        thickness: 2,
        color: approach.color,
      });
      
      testPage.drawLine({
        start: { x: 0, y: approach.courseNameY },
        end: { x: width, y: approach.courseNameY },
        thickness: 2,
        color: approach.color,
      });
      
      testPage.drawLine({
        start: { x: 0, y: approach.dateY },
        end: { x: width, y: approach.dateY },
        thickness: 2,
        color: approach.color,
      });
      
      // Add labels
      testPage.drawText(`${approach.name} - User (${approach.userNameY.toFixed(1)})`, {
        x: 10,
        y: approach.userNameY + 5,
        size: 8,
        font: regularFont,
        color: approach.color,
      });
      
      testPage.drawText(`${approach.name} - Course (${approach.courseNameY.toFixed(1)})`, {
        x: 10,
        y: approach.courseNameY + 5,
        size: 8,
        font: regularFont,
        color: approach.color,
      });
      
      testPage.drawText(`${approach.name} - Date (${approach.dateY.toFixed(1)})`, {
        x: 10,
        y: approach.dateY + 5,
        size: 8,
        font: regularFont,
        color: approach.color,
      });
    });
    
    // Save the debug PDF
    const pdfBytes = await testDoc.save();
    
    const testDir = path.join(__dirname, '..', 'test-certificates');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const fileName = `coordinate_debug_${Date.now()}.pdf`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, pdfBytes);
    
    console.log(`\n✅ Coordinate debug PDF saved to: ${filePath}`);
    console.log('🎨 Red lines: Approach 1 (28.3465 points/cm)');
    console.log('🎨 Green lines: Approach 2 (page height ratio)');

  } catch (error) {
    console.error('❌ Error debugging coordinate system:', error);
    throw error;
  }
}

// Run the debug
debugCoordinateSystem();