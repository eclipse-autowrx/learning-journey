// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import { convertPDFFileToPNG } from '../src/lib/pdf-to-png-converter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPDFToPNGConversion() {
  console.log('🧪 Testing PDF-to-PNG Conversion...\n');
  
  try {
    // Find the latest PDF certificate in test-certificates
    const testDir = path.join(__dirname, '..', 'test-certificates');
    const files = fs.readdirSync(testDir).filter(file => file.endsWith('.pdf'));
    
    if (files.length === 0) {
      console.log('❌ No PDF files found in test-certificates directory');
      console.log('💡 Please run the PDF generation test first');
      return;
    }
    
    // Use the most recent PDF file
    const latestPdf = files.sort().pop();
    const pdfPath = path.join(testDir, latestPdf);
    
    console.log(`📄 Using PDF file: ${latestPdf}`);
    
    // Convert to PNG
    const pngPath = path.join(testDir, latestPdf.replace('.pdf', '_converted.png'));
    
    console.log('🔄 Converting PDF to PNG...');
    const resultPath = await convertPDFFileToPNG(pdfPath, pngPath, {
      density: 300,
      width: 1500,
      height: 1061
    });
    
    console.log(`✅ PNG conversion completed!`);
    console.log(`📁 PNG saved to: ${resultPath}`);
    
    // Check file sizes
    const pdfStats = fs.statSync(pdfPath);
    const pngStats = fs.statSync(resultPath);
    
    console.log(`📊 PDF size: ${(pdfStats.size / 1024).toFixed(2)} KB`);
    console.log(`📊 PNG size: ${(pngStats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 PDF-to-PNG conversion test completed successfully!');
    console.log('💡 The PNG should have the same positioning as the PDF');

  } catch (error) {
    console.error('❌ PDF-to-PNG conversion test failed:', error);
    throw error;
  }
}

// Run the test
testPDFToPNGConversion();