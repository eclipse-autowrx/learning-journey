// Simple process-level name cache for mapping user_id to display name
const cache = new Map(); // id -> { name, expiresAt }
const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getCachedName(id) {
  if (!id) return null;
  const entry = cache.get(id);
  if (entry && entry.expiresAt > Date.now()) return entry.name;
  return null;
}

export function setCachedName(id, name) {
  if (!id) return;
  cache.set(id, { name, expiresAt: Date.now() + TTL_MS });
}
