// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadCertificateConfig, calculatePositions } from '../src/lib/certificate-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testConfigBasedGeneration() {
  console.log('🧪 Testing Configuration-Based Certificate Generation...\n');
  
  try {
    // Load and display configuration
    console.log('📋 Loading configuration from certificate_gen.cfg...');
    const config = loadCertificateConfig();
    
    console.log('\n📐 Configuration loaded:');
    console.log(`   Template height: ${config.template_height_cm} cm`);
    console.log(`   User name Y: ${config.user_name_y_cm} cm from top`);
    console.log(`   Path name Y: ${config.path_name_y_cm} cm from top`);
    console.log(`   Issue date Y: ${config.issue_date_y_cm} cm from top`);
    console.log(`   Issue date X shift: ${config.issue_date_x_shift_cm} cm`);
    console.log(`   User name font: ${config.user_name_font_size}pt × ${config.user_name_font_multiplier} = ${config.user_name_font_size * config.user_name_font_multiplier}pt`);
    console.log(`   Path name font: ${config.path_name_font_size}pt × ${config.path_name_font_multiplier} = ${config.path_name_font_size * config.path_name_font_multiplier}pt`);
    console.log(`   Issue date font: ${config.issue_date_font_size}pt × ${config.issue_date_font_multiplier} = ${config.issue_date_font_size * config.issue_date_font_multiplier}pt`);
    console.log(`   PNG DPI: ${config.png_dpi}`);
    
    // Test positioning calculation
    console.log('\n🧮 Testing positioning calculation...');
    const mockHeight = 595.5; // PDF height in points
    const positions = calculatePositions(config, mockHeight);
    
    console.log(`   Calculated positions for height ${mockHeight} points:`);
    console.log(`   User name Y: ${positions.userNameY.toFixed(2)} points`);
    console.log(`   Path name Y: ${positions.pathNameY.toFixed(2)} points`);
    console.log(`   Issue date Y: ${positions.issueDateY.toFixed(2)} points`);
    console.log(`   Issue date X shift: ${positions.issueDateXShift.toFixed(2)} points`);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test API generation
    console.log('🌐 Testing API generation with configuration...');
    
    const testData = {
      userName: 'John Doe',
      pathName: 'Full Stack Web Development',
      issueDate: 'January 15, 2025'
    };
    
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
      
      const pdfPath = path.join(testDir, `config_test_pdf_${Date.now()}.pdf`);
      fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
      console.log(`✅ PDF generated: ${pdfPath}`);
      console.log(`📊 PDF size: ${(pdfBuffer.byteLength / 1024).toFixed(2)} KB`);
    } else {
      console.log('❌ PDF generation failed:', pdfResponse.statusText);
    }

    // Test PNG generation
    console.log('\n🖼️  Testing PNG generation...');
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
      
      const pngPath = path.join(testDir, `config_test_png_${Date.now()}.png`);
      fs.writeFileSync(pngPath, Buffer.from(pngBuffer));
      console.log(`✅ PNG generated: ${pngPath}`);
      console.log(`📊 PNG size: ${(pngBuffer.byteLength / 1024).toFixed(2)} KB`);
    } else {
      console.log('❌ PNG generation failed:', pngResponse.statusText);
    }

    console.log('\n🎉 Configuration-based generation test completed!');
    console.log('💡 You can now modify certificate_gen.cfg to adjust positioning and font sizes.');

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
  await testConfigBasedGeneration();
}

// Run the test
main().catch(console.error);