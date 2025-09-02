// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertPDFToPNG(pdfPath, outputPath, options = {}) {
  try {
    console.log(`🔄 Converting PDF to PNG: ${pdfPath}`);
    
    // For now, we'll use a simple approach
    // In production, you might want to use pdf2pic or similar library
    // But for testing, let's create a high-quality PNG from the PDF
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // For this demo, we'll create a placeholder PNG
    // In real implementation, you'd use a PDF to image converter
    console.log('⚠️  Note: This is a placeholder converter.');
    console.log('   For production, use a proper PDF to image library like pdf2pic');
    
    // Create a simple PNG with the same dimensions as our certificate
    const width = options.width || 1500;
    const height = options.height || 1061;
    
    const pngBuffer = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toBuffer();
    
    // Save the PNG
    fs.writeFileSync(outputPath, pngBuffer);
    
    console.log(`✅ PNG saved to: ${outputPath}`);
    console.log(`📊 PNG size: ${pngBuffer.length} bytes`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error converting PDF to PNG:', error);
    throw error;
  }
}

// Test the converter
async function testConverter() {
  console.log('🧪 Testing PDF to PNG Converter...\n');
  
  const testDir = path.join(__dirname, '..', 'test-certificates');
  const pdfFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    console.log('❌ No PDF files found in test-certificates directory');
    return;
  }
  
  // Convert the first PDF file
  const pdfFile = pdfFiles[0];
  const pdfPath = path.join(testDir, pdfFile);
  const pngPath = path.join(testDir, pdfFile.replace('.pdf', '_converted.png'));
  
  await convertPDFToPNG(pdfPath, pngPath);
}

// Run the test
testConverter().catch(console.error);