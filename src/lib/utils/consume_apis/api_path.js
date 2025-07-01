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

async function fetchPathBySlug(slug, user_id, token) {
    if (!slug) throw ('Invalid post slug');

    try {
        const response = (await fetch(process.env.HOST + `/api/paths/${slug}?user_id=${user_id}&token=${token}`))
        const data = await response.json();
        if (data && data.success) {
            return data.data
        } else {
            throw ('Path not found')
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

export { fetchPathBySlug, fetchPaths }
