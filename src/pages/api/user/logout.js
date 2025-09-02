// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Clear cookies by setting them to expire in the past
    res.setHeader('Set-Cookie', [
      'user_id=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:01 GMT;',
      'token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:01 GMT;',
    ]);
    
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ success: false, error: 'Logout failed' });
  }
}