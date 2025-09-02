// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data
const testData = {
  userId: 'test_user_123',
  userName: 'John Doe',
  pathId: 'test_path_456',
  pathName: 'Full Stack Web Development'
};

async function testCertificateSystem() {
  console.log('🧪 Testing Certificate System...\n');
  console.log('📋 Test Data:');
  console.log(`   User ID: ${testData.userId}`);
  console.log(`   User Name: ${testData.userName}`);
  console.log(`   Path ID: ${testData.pathId}`);
  console.log(`   Path Name: ${testData.pathName}`);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Test 1: Complete path and generate certificate
    console.log('🎯 Test 1: Complete path and generate certificate...');
    const completeResponse = await fetch('http://localhost:3000/api/certificates/complete-path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pathId: testData.pathId,
        pathName: testData.pathName
      }),
    });

    if (completeResponse.ok) {
      const completeData = await completeResponse.json();
      console.log('✅ Path completion successful');
      console.log('📄 Certificate generated:', completeData.certificate);
    } else {
      const errorData = await completeResponse.json();
      console.log('❌ Path completion failed:', errorData.error);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: Get certificate information
    console.log('🎯 Test 2: Get certificate information...');
    const getResponse = await fetch(`http://localhost:3000/api/certificates/get?pathId=${testData.pathId}`);

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Certificate info retrieved');
      console.log('📄 Certificate info:', getData.certificate);
    } else {
      const errorData = await getResponse.json();
      console.log('❌ Get certificate failed:', errorData.error);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 3: Regenerate certificate with custom name
    console.log('🎯 Test 3: Regenerate certificate with custom name...');
    const regenerateResponse = await fetch('http://localhost:3000/api/certificates/regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pathId: testData.pathId,
        pathName: testData.pathName,
        customUserName: 'Johnny Doe'
      }),
    });

    if (regenerateResponse.ok) {
      const regenerateData = await regenerateResponse.json();
      console.log('✅ Certificate regenerated successfully');
      console.log('📄 New certificate:', regenerateData.certificate);
    } else {
      const errorData = await regenerateResponse.json();
      console.log('❌ Regenerate certificate failed:', errorData.error);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 4: Check generated files
    console.log('🎯 Test 4: Check generated certificate files...');
    const certificatesDir = path.join(__dirname, '..', 'public', 'certificates');
    
    if (fs.existsSync(certificatesDir)) {
      const pdfDir = path.join(certificatesDir, 'pdf');
      const pngDir = path.join(certificatesDir, 'png');
      
      console.log('📁 Certificates directory exists');
      
      if (fs.existsSync(pdfDir)) {
        const pdfFiles = fs.readdirSync(pdfDir);
        console.log(`📄 PDF files (${pdfFiles.length}):`, pdfFiles);
      }
      
      if (fs.existsSync(pngDir)) {
        const pngFiles = fs.readdirSync(pngDir);
        console.log(`🖼️  PNG files (${pngFiles.length}):`, pngFiles);
      }
    } else {
      console.log('❌ Certificates directory not found');
    }

    console.log('\n🎉 Certificate system test completed!');

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
    const response = await fetch('http://localhost:3000/api/certificates/get?pathId=test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
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
  await testCertificateSystem();
}

// Run the test
main().catch(console.error);