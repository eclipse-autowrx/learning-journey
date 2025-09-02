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

async function debugPDFCertificate() {
  console.log('🔍 Debugging PDF Certificate Generation...\n');
  
  try {
    // Load the empty certificate template
    const templatePath = path.join(__dirname, '..', 'cert', 'certificate_empty.pdf');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    console.log(`📁 Template path: ${templatePath}`);
    const templateBytes = fs.readFileSync(templatePath);
    console.log(`📊 Template size: ${templateBytes.length} bytes`);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    console.log(`📏 PDF dimensions: ${width} x ${height}`);
    console.log(`📄 Number of pages: ${pages.length}`);

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Test different positioning strategies
    const centerX = width / 2;
    
    // Strategy 1: Current positioning (might be wrong)
    console.log('\n📍 Strategy 1: Current positioning');
    const positions1 = {
      userName: { x: centerX, y: height * 0.55, size: 24 },
      pathName: { x: centerX, y: height * 0.45, size: 18 },
      issueDate: { x: centerX, y: height * 0.35, size: 14 }
    };
    
    console.log('User Name:', positions1.userName);
    console.log('Path Name:', positions1.pathName);
    console.log('Issue Date:', positions1.issueDate);

    // Strategy 2: More centered positioning
    console.log('\n📍 Strategy 2: More centered positioning');
    const positions2 = {
      userName: { x: centerX, y: height * 0.6, size: 24 },
      pathName: { x: centerX, y: height * 0.5, size: 18 },
      issueDate: { x: centerX, y: height * 0.4, size: 14 }
    };
    
    console.log('User Name:', positions2.userName);
    console.log('Path Name:', positions2.pathName);
    console.log('Issue Date:', positions2.issueDate);

    // Strategy 3: Lower positioning (for bottom-heavy certificates)
    console.log('\n📍 Strategy 3: Lower positioning');
    const positions3 = {
      userName: { x: centerX, y: height * 0.7, size: 24 },
      pathName: { x: centerX, y: height * 0.6, size: 18 },
      issueDate: { x: centerX, y: height * 0.5, size: 14 }
    };
    
    console.log('User Name:', positions3.userName);
    console.log('Path Name:', positions3.pathName);
    console.log('Issue Date:', positions3.issueDate);

    // Generate test certificates with different strategies
    const strategies = [
      { name: 'strategy1', positions: positions1 },
      { name: 'strategy2', positions: positions2 },
      { name: 'strategy3', positions: positions3 }
    ];

    for (const strategy of strategies) {
      console.log(`\n🎨 Generating ${strategy.name}...`);
      
      // Create a new document for each strategy
      const testDoc = await PDFDocument.load(templateBytes);
      const testPages = testDoc.getPages();
      const testPage = testPages[0];
      
      const testFont = await testDoc.embedFont(StandardFonts.HelveticaBold);
      const testRegularFont = await testDoc.embedFont(StandardFonts.Helvetica);

      // Helper function to center text
      const getCenteredX = (text, fontSize, font) => {
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        return centerX - (textWidth / 2);
      };

      // Add user name
      const userNameX = getCenteredX(testData.userName, strategy.positions.userName.size, testFont);
      testPage.drawText(testData.userName, {
        x: userNameX,
        y: strategy.positions.userName.y,
        size: strategy.positions.userName.size,
        font: testFont,
        color: rgb(0, 0, 0),
      });

      // Add path name
      const pathNameX = getCenteredX(testData.pathName, strategy.positions.pathName.size, testRegularFont);
      testPage.drawText(testData.pathName, {
        x: pathNameX,
        y: strategy.positions.pathName.y,
        size: strategy.positions.pathName.size,
        font: testRegularFont,
        color: rgb(0, 0, 0),
      });

      // Add issue date
      const issueDateX = getCenteredX(testData.issueDate, strategy.positions.issueDate.size, testRegularFont);
      testPage.drawText(testData.issueDate, {
        x: issueDateX,
        y: strategy.positions.issueDate.y,
        size: strategy.positions.issueDate.size,
        font: testRegularFont,
        color: rgb(0, 0, 0),
      });

      // Save the PDF
      const pdfBytes = await testDoc.save();
      
      // Save to test directory
      const testDir = path.join(__dirname, '..', 'test-certificates');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      const fileName = `debug_${strategy.name}_${Date.now()}.pdf`;
      const filePath = path.join(testDir, fileName);
      
      fs.writeFileSync(filePath, pdfBytes);
      
      console.log(`✅ ${strategy.name} saved to: ${filePath}`);
      console.log(`📊 File size: ${pdfBytes.length} bytes`);
    }

    console.log('\n🎉 Debug certificates generated!');
    console.log('📁 Check the test-certificates directory to see which positioning looks best.');

  } catch (error) {
    console.error('❌ Error debugging PDF certificate:', error);
    throw error;
  }
}

// Run the debug
debugPDFCertificate();