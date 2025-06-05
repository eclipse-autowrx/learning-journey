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
        `user_id=${user_id}; Path=/; HttpOnly; SameSite=none;Secure;`,
        `token=${token}; Path=/; HttpOnly; SameSite=none;Secure;`
    ]);

    res.status(200).json({ status: 'ok' });
}
