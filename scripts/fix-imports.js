#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing import statements in mock data files...');

const mockDataDir = './src/lib/mock_data';

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix import statements that are missing .js extension
    const importRegex = /import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g;
    const matches = content.match(importRegex);
    
    if (matches) {
      matches.forEach(match => {
        const pathMatch = match.match(/from\s+['"`]([^'"`]+)['"`]/);
        if (pathMatch) {
          const importPath = pathMatch[1];
          // Skip if it already has .js extension or is a relative path with .js
          if (!importPath.endsWith('.js') && !importPath.startsWith('@/')) {
            const newPath = importPath + '.js';
            const newImport = match.replace(importPath, newPath);
            content = content.replace(match, newImport);
            modified = true;
            console.log(`  Fixed: ${importPath} -> ${newPath}`);
          }
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing imports in ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        fixImportsInFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
}

// Process the mock data directory
processDirectory(mockDataDir);

console.log('\n🎉 Import fixing completed!');
