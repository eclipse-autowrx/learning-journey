// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const BASE_URL = (process.env.USER_BASE_URL || 'https://backend-core-dev.digital.auto/v2').replace(/\/$/, '');

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    // 1) Call external /auth/login
    const loginResp = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const loginData = await safeJson(loginResp);
    if (!loginResp.ok) {
      const msg = loginData?.error || loginData?.message || `Login failed (${loginResp.status})`;
      return res.status(loginResp.status || 500).json({ success: false, error: msg, data: loginData });
    }

    const accessToken = extractAccessToken(loginData);
    const access = extractAccessObject(loginData);
    if (!accessToken) {
      return res.status(502).json({ success: false, error: 'No access token returned from external service', data: loginData });
    }

    // 2) Fetch user profile to get user id
    const selfResp = await fetch(`${BASE_URL}/users/self`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include'
    });
    const selfData = await safeJson(selfResp);
    if (!selfResp.ok) {
      const msg = selfData?.error || selfData?.message || `Failed to fetch profile (${selfResp.status})`;
      return res.status(selfResp.status || 500).json({ success: false, error: msg, data: selfData });
    }
    const userId = selfData?.id || selfData?.user?.id || selfData?.data?.id;
    if (!userId) {
      return res.status(502).json({ success: false, error: 'Could not determine user id from profile', data: selfData });
    }

    return res.status(200).json({ success: true, access, user: { id: userId, profile: selfData } });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Proxy login failed' });
  }
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

function extractAccessObject(data) {
  if (!data) return null;
  if (data.access?.token) return data.access;
  if (data.tokens?.access?.token) return data.tokens.access;
  if (data.data?.access?.token) return data.data.access;
  if (data.data?.tokens?.access?.token) return data.data.tokens.access;
  // Fallback when only token provided
  const token = extractAccessToken(data);
  if (token) return { token, expires: data?.access?.expires || data?.data?.access?.expires || null };
  return null;
}

function extractAccessToken(data) {
  if (!data) return undefined;
  if (data.access?.token) return data.access.token;
  if (data.tokens?.access?.token) return data.tokens.access.token;
  if (data.accessToken) return data.accessToken;
  if (data.access_token) return data.access_token;
  if (data.token) return data.token;
  const nested = data.data;
  if (nested?.access?.token) return nested.access.token;
  if (nested?.tokens?.access?.token) return nested.tokens.access.token;
  if (nested?.accessToken) return nested.accessToken;
  if (nested?.access_token) return nested.access_token;
  return undefined;
}
