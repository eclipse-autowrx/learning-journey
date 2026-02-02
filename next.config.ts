// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://bewebstudio.digitalauto.tech/data/projects/**')],
  },

  // Configure build output
  output: 'standalone',

  // Optimize for production
  poweredByHeader: false,

  // Configure caching headers
  async headers() {
    const headers = [];

    // Development CORS headers
    if (isDev) {
      headers.push({
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
        ],
      });
    }

    // Production caching headers
    if (!isDev) {
      headers.push(
        {
          // Cache static assets aggressively
          source: '/_next/static/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
        {
          // No cache for API routes
          source: '/api/:path*',
          headers: [
            { key: 'Cache-Control', value: 'no-store' },
          ],
        },
        {
          // Cache pages for 2 minutes, allow stale-while-revalidate for 1 day
          source: '/:path((?!api/).*)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=4800, s-maxage=4800, stale-while-revalidate=86400' },
          ],
        }
      );
    }

    return headers;
  },

  // Enable compression
  compress: true,

  // Rewrite rules for media files
  async rewrites() {
    const rewrites = [];

    // Map media paths to API routes to serve from MEDIA_STORE_PATH
    // Next.js standalone mode doesn't properly serve files from symlinked directories
    if (!isDev) {
      // Map /certificates/* to API route
      rewrites.push({
        source: '/certificates/:path*',
        destination: '/api/certificates/:path*',
      });
      
      // Map /images/* to API route
      rewrites.push({
        source: '/images/:path*',
        destination: '/api/images/:path*',
      });
      
      // Map /files/* to API route
      rewrites.push({
        source: '/files/:path*',
        destination: '/api/files/:path*',
      });
    }

    return rewrites;
  },
};

export default nextConfig;
