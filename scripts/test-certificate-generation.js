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
  issueDate: 'January 15, 2025',
  format: 'pdf' // Change to 'png' to test PNG generation
};

async function testCertificateGeneration() {
  console.log('🧪 Testing Certificate Generation...\n');
  
  try {
    // Test PDF generation
    console.log('📄 Testing PDF Certificate Generation...');
    const pdfResult = await generateCertificate('pdf');
    if (pdfResult.success) {
      console.log('✅ PDF certificate generated successfully');
      console.log(`📁 Saved to: ${pdfResult.filePath}`);
    } else {
      console.log('❌ PDF certificate generation failed:', pdfResult.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test PNG generation
    console.log('🖼️  Testing PNG Certificate Generation...');
    const pngResult = await generateCertificate('png');
    if (pngResult.success) {
      console.log('✅ PNG certificate generated successfully');
      console.log(`📁 Saved to: ${pngResult.filePath}`);
    } else {
      console.log('❌ PNG certificate generation failed:', pngResult.error);
    }

    console.log('\n🎉 Certificate generation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function generateCertificate(format) {
  try {
    const response = await fetch('http://localhost:3000/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testData,
        format: format
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'HTTP error' };
    }

    // Get the file buffer
    const buffer = await response.arrayBuffer();
    
    // Save to test directory
    const testDir = path.join(__dirname, '..', 'test-certificates');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const fileName = `test_certificate_${testData.userName.replace(/\s+/g, '_')}_${Date.now()}.${format}`;
    const filePath = path.join(testDir, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return { success: true, filePath };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test with different data sets
async function testMultipleCertificates() {
  console.log('🧪 Testing Multiple Certificate Variations...\n');

  const testCases = [
    {
      userName: 'Alice Johnson',
      pathName: 'Data Science Fundamentals',
      issueDate: 'February 1, 2025',
      format: 'pdf'
    },
    {
      userName: 'Bob Smith',
      pathName: 'Machine Learning with Python',
      issueDate: 'February 15, 2025',
      format: 'png'
    },
    {
      userName: 'Carol Williams',
      pathName: 'Cybersecurity Essentials',
      issueDate: 'March 1, 2025',
      format: 'pdf'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 Test Case ${i + 1}: ${testCase.userName} - ${testCase.pathName}`);
    
    const result = await generateCertificate(testCase.format);
    if (result.success) {
      console.log(`✅ Generated: ${result.filePath}`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
    console.log('');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--multiple')) {
    await testMultipleCertificates();
  } else {
    await testCertificateGeneration();
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

// Run the test
main().catch(console.error);