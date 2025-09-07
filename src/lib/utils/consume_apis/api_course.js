// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

async function fetchCourseBySlug(slug, queryParams, origin) {
    if (!slug) throw ('Invalid post slug');
    try {
        const isServer = typeof window === 'undefined';
        const baseUrl = origin || (isServer
            ? (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
            : '');
        console.log(`fetchCourseBySlug ${baseUrl}/api/courses/${slug}?${queryParams}`)
        const response = await fetch(`${baseUrl}/api/courses/${slug}?${queryParams}`)
        const data = await response.json();
        if (data && data.success) {
            return data.data
        } else {
            throw ('Course not found')
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

export { fetchCourseBySlug }
