// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data
const testData = {
  userName: 'Jane Smith',
  pathName: 'Advanced React Development',
  issueDate: 'February 20, 2025',
  format: 'pdf'
};

async function testCertificateAPI() {
  console.log('🧪 Testing Certificate Generation API...\n');
  console.log('📋 Test Data:');
  console.log(`   User Name: ${testData.userName}`);
  console.log(`   Path Name: ${testData.pathName}`);
  console.log(`   Issue Date: ${testData.issueDate}`);
  console.log(`   Format: ${testData.format}`);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Test the generate endpoint
    console.log('🌐 Testing /api/certificates/generate endpoint...');
    
    const response = await fetch('http://localhost:3000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }

    // Get the file buffer
    const buffer = await response.arrayBuffer();
    
    // Save to test directory
    const testDir = path.join(__dirname, '..', 'test-certificates');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const fileName = `api_test_certificate_${testData.userName.replace(/\s+/g, '_')}_${Date.now()}.${testData.format}`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(buffer));

    console.log(`✅ API certificate generated successfully`);
    console.log(`📁 Saved to: ${filePath}`);
    console.log(`📊 File size: ${buffer.byteLength} bytes`);

    // Test PNG generation
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('🖼️  Testing PNG generation...');
    
    const pngData = { ...testData, format: 'png' };
    const pngResponse = await fetch('http://localhost:3000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pngData),
    });

    if (!pngResponse.ok) {
      const errorData = await pngResponse.json();
      throw new Error(`PNG API Error: ${errorData.error || pngResponse.statusText}`);
    }

    const pngBuffer = await pngResponse.arrayBuffer();
    const pngFileName = `api_test_certificate_${testData.userName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    const pngFilePath = path.join(testDir, pngFileName);
    
    fs.writeFileSync(pngFilePath, Buffer.from(pngBuffer));

    console.log(`✅ PNG certificate generated successfully`);
    console.log(`📁 Saved to: ${pngFilePath}`);
    console.log(`📊 File size: ${pngBuffer.byteLength} bytes`);

    console.log('\n🎉 API certificate generation test completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure your Next.js development server is running:');
      console.log('   npm run dev');
    }
    
    process.exit(1);
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
  await testCertificateAPI();
}

// Run the test
main().catch(console.error);