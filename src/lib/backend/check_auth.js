// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

export const check_auth = (req, res) => {
    let user_id = req.query.user_id;
    let token = req.query.token;


    // If not in query, try to get from cookies
    if (!user_id || !token) {
        const cookie = req.headers.cookie;
        if (cookie) {
            const cookies = Object.fromEntries(cookie.split(';').map(c => {
                const [k, ...v] = c.trim().split('=');
                return [k, decodeURIComponent(v.join('='))];
            }));
            if (!user_id) user_id = cookies.user_id;
            if (!token) token = cookies.token;
        } else {
            // console.log(">>>>>>>> There is no cookie in header")
        }
    }

    // If still missing, return unauthorized
    // if (!user_id || !token) {
    //     return res.status(401).json({ 
    //         success: false, 
    //         error: "Unauthorized: Missing user_id or token" });
    // }

    // console.log("user_id", user_id)

    return { user_id, token };
}