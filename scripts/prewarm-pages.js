// Copyright (c) 2025 Eclipse Foundation.
//
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { execSync } from 'child_process';

/**
 * Pre-warm script to build and cache pages for better first-user experience
 * This script runs after the Next.js build to pre-generate commonly accessed pages
 */

// Use NEXT_PUBLIC_BASE_URL if set, otherwise construct from PORT env var (defaults to 3000)
const PORT = process.env.PORT || '3000';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${PORT}`;
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
    // Use single quotes for the format string to avoid shell interpretation issues
    const statusCode = execSync(
      `curl -s -o /dev/null -w '%{http_code}' "${url}"`,
      { encoding: 'utf8', shell: '/bin/sh' }
    ).trim();

    if (statusCode === '200') {
      console.log(`✅ Successfully pre-warmed: ${url}`);
    } else {
      console.log(`⚠️  Pre-warm returned status ${statusCode} for: ${url}`);
    }
  } catch (error) {
    console.log(`❌ Failed to pre-warm: ${url} - ${error.message}`);
  }
}

async function waitForServer(url, maxRetries = 30) {
  console.log('⏳ Waiting for server to be ready...');
  for (let i = 0; i < maxRetries; i++) {
    try {
      const command = `curl -s -o /dev/null -w "%{http_code}" --max-time 2 "${url}" || echo "000"`;
      const statusCode = execSync(command, { encoding: 'utf8' }).trim();
      if (statusCode !== '000' && statusCode !== '') {
        console.log(`✅ Server is ready (status: ${statusCode})`);
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('⚠️  Server may not be ready, proceeding anyway...');
  return false;
}

async function prewarmPages() {
  console.log(`🌐 Pre-warming pages on ${BASE_URL}`);

  // Wait for server to be ready
  await waitForServer(`${BASE_URL}/api/health`);

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