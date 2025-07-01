// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
      remotePatterns: [new URL('https://bewebstudio.digitalauto.tech/data/projects/**')],
    }
};

export default nextConfig;
