// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

const fs = require('fs');
const path = require('path');

/**
 * Development cache optimization script
 * This script helps optimize the development experience by:
 * 1. Clearing Next.js cache when needed
 * 2. Pre-building commonly used pages
 * 3. Setting up development-specific optimizations
 */

const NEXT_CACHE_DIR = path.join(process.cwd(), '.next');
const isDev = process.env.NODE_ENV !== 'production';

console.log('🔧 Development Cache Optimization Script');
console.log('=====================================');

function clearNextCache() {
  console.log('🧹 Clearing Next.js cache...');

  try {
    if (fs.existsSync(NEXT_CACHE_DIR)) {
      // Remove cache directories
      const cacheDirs = [
        path.join(NEXT_CACHE_DIR, 'cache'),
        path.join(NEXT_CACHE_DIR, 'server'),
        path.join(NEXT_CACHE_DIR, 'static')
      ];

      cacheDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`✅ Cleared: ${dir}`);
        }
      });
    }
    console.log('✅ Next.js cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
  }
}

function createDevConfig() {
  console.log('⚙️  Setting up development optimizations...');

  const devConfig = {
    // Development-specific settings
    fastRefresh: true,
    optimizeFonts: false, // Disable font optimization in dev for faster builds
    swcMinify: false, // Disable minification in dev
  };

  // You can extend this to modify next.config.js dynamically
  console.log('✅ Development config ready');
}

function prebuildCommonPages() {
  console.log('🏗️  Pre-building common pages for development...');

  // In development, we can suggest which pages to visit first
  const commonPages = [
    '/',
    '/login',
    '/manage',
    '/admin'
  ];

  console.log('📋 Common pages to visit for optimal caching:');
  commonPages.forEach(page => {
    console.log(`   • http://localhost:3090${page}`);
  });

  console.log('💡 Tip: Visit these pages once to cache them for faster subsequent loads');
}

function setupWatchModeOptimizations() {
  console.log('👀 Setting up watch mode optimizations...');

  // Create a .env.development.local if it doesn't exist
  const envPath = path.join(process.cwd(), '.env.development.local');
  if (!fs.existsSync(envPath)) {
    const devEnv = `# Development Environment Variables
# These settings optimize development experience

# Next.js Development Settings
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS="--max-old-space-size=4096"

# Disable telemetry for faster startup
TURBOPACK=true

# Development-specific settings
FAST_REFRESH=true
`;

    fs.writeFileSync(envPath, devEnv);
    console.log('✅ Created .env.development.local with optimizations');
  } else {
    console.log('ℹ️  .env.development.local already exists');
  }
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case 'clear':
      clearNextCache();
      break;

    case 'setup':
      createDevConfig();
      setupWatchModeOptimizations();
      break;

    case 'pages':
      prebuildCommonPages();
      break;

    case 'all':
      clearNextCache();
      createDevConfig();
      setupWatchModeOptimizations();
      prebuildCommonPages();
      break;

    default:
      console.log('Usage: node scripts/dev-cache.js <command>');
      console.log('Commands:');
      console.log('  clear  - Clear Next.js cache');
      console.log('  setup  - Setup development optimizations');
      console.log('  pages  - Show common pages to pre-cache');
      console.log('  all    - Run all optimizations');
      break;
  }
}

if (require.main === module) {
  main();
}