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
          // Cache pages for 1 hour, allow stale-while-revalidate for 1 day
          source: '/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
          ],
        }
      );
    }

    return headers;
  },

  // Enable compression
  compress: true,
};

export default nextConfig;
