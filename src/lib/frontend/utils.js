export const genQueryParamsForRequest = () => {
    let query = ''
    const queryParams = {};
    if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value;
        }

        if (!queryParams.user_id) {
            const storedUserId = localStorage.getItem('user_id');
            if (storedUserId) {
                queryParams.user_id = storedUserId;
            }
        }

        if (!queryParams.token) {
            const storedToken = localStorage.getItem('token');
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