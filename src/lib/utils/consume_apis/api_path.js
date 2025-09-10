// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

async function fetchPaths() {
    try {
        const response = (await fetch("/api/paths"))
        const data = await response.json();
        if (data && data.success) {
            return data.data
        } else {
            throw ('Paths not found')
        }
    } catch (error) {
        return []
    }
}

async function fetchPathBySlug(slug, user_id, token, origin) {
    if (!slug) throw ('Invalid post slug');

    try {
        // Determine base URL: server needs absolute, client can be relative
        const isServer = typeof window === 'undefined';
        const baseUrl = origin || (isServer
            ? (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
            : '');

        const qs = `user_id=${encodeURIComponent(user_id || '')}&token=${encodeURIComponent(token || '')}`;
        const response = await fetch(`${baseUrl}/api/paths/${slug}?${qs}`);
        const data = await response.json();
        if (data && data.success) {
            return data.data
        } else {
            throw (data?.error || 'Path not found')
        }
    } catch (error) {
        return null
    }
}

export { fetchPathBySlug, fetchPaths }
