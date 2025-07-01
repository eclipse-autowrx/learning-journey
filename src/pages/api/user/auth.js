// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const { user_id, token } = req.query;

    if (!user_id || !token) {
        res.status(400).json({ error: 'Missing user_id or token' });
        return;
    }

    // Set cookies for user_id and token
    res.setHeader('Set-Cookie', [
        `user_id=${user_id}; Path=/; HttpOnly; SameSite=Lax`,
        `token=${token}; Path=/; HttpOnly; SameSite=Lax`
    ]);

    res.status(200).json({ status: 'ok' });
}
