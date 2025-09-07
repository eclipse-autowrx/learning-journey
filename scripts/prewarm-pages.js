// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

const { execSync } = require('child_process');

/**
 * Pre-warm script to build and cache pages for better first-user experience
 * This script runs after the Next.js build to pre-generate commonly accessed pages
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV !== 'production';

console.log('🚀 Starting page pre-warming process...');

// List of pages to pre-warm (most commonly accessed)
const pagesToPrewarm = [
  '/',           // Home page
  '/login',      // Login page
  '/manage',     // Management dashboard
  '/admin',      // Admin panel
];

// Additional dynamic pages that might be commonly accessed
const dynamicPagesToPrewarm = [
  '/manage/paths',  // If you have specific paths
];

// Popular paths to pre-warm (add your most accessed path slugs here)
const popularPaths = [
  // Add your most popular path slugs here, e.g.:
  // 'sdv-101',
  // 'advanced-sdv',
];

async function prewarmPage(url) {
  try {
    console.log(`📄 Pre-warming: ${url}`);

    // Use curl to request the page (this will trigger ISR if configured)
    const command = `curl -s -o /dev/null -w "%{http_code}" "${url}"`;
    const statusCode = execSync(command, { encoding: 'utf8' }).trim();

    if (statusCode === '200') {
      console.log(`✅ Successfully pre-warmed: ${url}`);
    } else {
      console.log(`⚠️  Pre-warm returned status ${statusCode} for: ${url}`);
    }
  } catch (error) {
    console.log(`❌ Failed to pre-warm: ${url} - ${error.message}`);
  }
}

async function prewarmPages() {
  console.log(`🌐 Pre-warming pages on ${BASE_URL}`);

  // Wait a bit for the server to be ready
  if (!isDev) {
    console.log('⏳ Waiting for server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Pre-warm static pages
  for (const page of pagesToPrewarm) {
    await prewarmPage(`${BASE_URL}${page}`);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Pre-warm dynamic pages (if they exist)
  for (const page of dynamicPagesToPrewarm) {
    await prewarmPage(`${BASE_URL}${page}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Pre-warm popular path pages
  for (const pathSlug of popularPaths) {
    await prewarmPage(`${BASE_URL}/path/${pathSlug}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🎉 Page pre-warming completed!');
}

// Only run pre-warming in production or when explicitly requested
if (!isDev || process.argv.includes('--force')) {
  prewarmPages().catch(console.error);
} else {
  console.log('ℹ️  Skipping pre-warming in development mode. Use --force to override.');
}