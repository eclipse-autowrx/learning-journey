// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

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

async function testBothFormats() {
  console.log('🧪 Testing Both PDF and PNG Generation...\n');
  console.log('📋 Test Data:');
  console.log(`   User Name: ${testData.userName}`);
  console.log(`   Path Name: ${testData.pathName}`);
  console.log(`   Issue Date: ${testData.issueDate}`);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Test PDF generation
    console.log('📄 Testing PDF generation...');
    const pdfResponse = await fetch('http://localhost:3000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testData,
        format: 'pdf'
      }),
    });

    if (pdfResponse.ok) {
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const testDir = path.join(__dirname, '..', 'test-certificates');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      const pdfPath = path.join(testDir, `test_pdf_${Date.now()}.pdf`);
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      console.log(`✅ PDF generated: ${pdfPath}`);
      console.log(`📊 PDF size: ${(pdfBuffer.byteLength / 1024).toFixed(2)} KB`);
    } else {
      console.log('❌ PDF generation failed:', pdfResponse.statusText);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test PNG generation
    console.log('🖼️  Testing PNG generation...');
    const pngResponse = await fetch('http://localhost:3000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testData,
        format: 'png'
      }),
    });

    if (pngResponse.ok) {
      const pngBuffer = await pngResponse.arrayBuffer();
      const testDir = path.join(__dirname, '..', 'test-certificates');
      
      const pngPath = path.join(testDir, `test_png_${Date.now()}.png`);
      fs.writeFileSync(pngPath, Buffer.from(pngBuffer));
      console.log(`✅ PNG generated: ${pngPath}`);
      console.log(`📊 PNG size: ${(pngBuffer.byteLength / 1024).toFixed(2)} KB`);
    } else {
      console.log('❌ PNG generation failed:', pngResponse.statusText);
    }

    console.log('\n🎉 Both format tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure your Next.js development server is running:');
      console.log('   npm run dev');
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/certificates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: 'test', pathName: 'test', issueDate: 'test' })
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('💡 Please start your Next.js development server first:');
    console.log('   npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await testBothFormats();
}

// Run the test
main().catch(console.error);