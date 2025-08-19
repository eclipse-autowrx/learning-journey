// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

const getCookie = (name) => {
    if (typeof document === 'undefined') {
        return null;
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

export const genQueryParamsForRequest = () => {
    let query = ''
    const queryParams = {};
    if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value;
        }

        if (!queryParams.user_id) {
            const storedUserId = getCookie('user_id');
            if (storedUserId) {
                queryParams.user_id = storedUserId;
            }
        }

        if (!queryParams.token) {
            const storedToken = getCookie('token');
            if (storedToken) {
                queryParams.token = storedToken;
            }
        }
    }

    

    if (queryParams.user_id && /^[a-f\d]{24}$/i.test(queryParams.user_id)) {
        query += `&user_id=${encodeURIComponent(queryParams.user_id)}`
    }

    if (queryParams.token) {
        query += `&token=${encodeURIComponent(queryParams.token)}`
    }

    return query
}