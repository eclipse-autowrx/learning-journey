// Copyright (c) 2025 Eclipse Foundation.
// SPDX-License-Identifier: MIT

const BASE_URL = (process.env.USER_BASE_URL || 'https://backend-core-dev.digital.auto/v2').replace(/\/$/, '');

// Simple in-memory cache with TTL for user profiles
const userCache = new Map(); // key: userId, value: { user, expiresAt }
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function doFetch(path, { token } = {}) {
  if (!BASE_URL) throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  if (!res.ok) {
    let msg = `Request failed ${res.status}`;
    try { const data = await res.json(); msg = data.error || data.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

export const ExternalUserService = {
  async getSelf(token) {
    if (!token) throw new Error('Missing token');
    const data = await doFetch('/users/self', { token });
    return data;
  },

  async validateUser(userId, token) {
    try {
      const data = await this.getSelf(token);
      const id = data?.id || data?.user?.id || data?.data?.id;
      if (!id) return { valid: false };
      return { valid: id === userId, user: data };
    } catch (e) {
      return { valid: false, error: e?.message };
    }
  },

  async getUsersByIds(ids, token) {
    if (!ids || ids.length === 0) return [];
    const distinct = [...new Set(ids.filter(Boolean))];
    // Lookup cache first
    const now = Date.now();
    const fresh = []; const missing = [];
    for (const id of distinct) {
      const c = userCache.get(id);
      if (c && c.expiresAt > now) fresh.push(c.user); else missing.push(id);
    }
    let fetched = [];
    if (missing.length > 0) {
      const raw = await doFetch(`/users/${encodeURIComponent(missing.join(','))}`, { token });
      // Normalize various response shapes from external service
      const normalized = [];
      if (Array.isArray(raw)) {
        normalized.push(...raw);
      } else if (Array.isArray(raw?.results)) {
        normalized.push(...raw.results);
      } else if (Array.isArray(raw?.data)) {
        normalized.push(...raw.data);
      } else if (raw?.user) {
        normalized.push(raw.user);
      } else if (raw?.data && (raw.data.id || raw.data.user)) {
        normalized.push(raw.data.user || raw.data);
      } else if (raw?.id) {
        normalized.push(raw);
      }

      fetched = normalized;

      // write to cache
      for (const u of fetched) {
        const id = u?.id || u?._id;
        if (id) userCache.set(id, { user: u, expiresAt: now + DEFAULT_TTL_MS });
      }
    }
    return [...fresh, ...fetched];
  },

  async getNameMap(ids, token) {
    const users = await this.getUsersByIds(ids, token);
    const map = {};
    for (const u of users) {
      if (!u) continue;
      const id = u.id || u._id;
      const name = u.name || u.displayName || u.email || id;
      map[id] = name;
    }
    return map;
  },

  // Permission APIs
  // permissions: string | string[]
  async hasPermissions(permissions, token) {
    if (!token) throw new Error('Missing token');
    const list = Array.isArray(permissions) ? permissions : [permissions];
    const query = encodeURIComponent(list.join(','));
    const result = await doFetch(`/permissions/has-permission?permissions=${query}`, { token });
    // Expecting an array of booleans per docs
    if (Array.isArray(result)) return result;
    // Some backends may wrap the array
    if (Array.isArray(result?.data)) return result.data;
    throw new Error('Unexpected response from permission service');
  },

  async hasPermission(permission, token) {
    const arr = await this.hasPermissions([permission], token);
    return Array.isArray(arr) ? Boolean(arr[0]) : false;
  }
};
