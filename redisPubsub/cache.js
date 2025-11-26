// cache.js
const cache = new Map();

function setCache(key, value, ttlMs) {
  const expireAt = Date.now() + ttlMs;
  cache.set(key, { value, expireAt });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expireAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function deleteCache(key) {
  cache.delete(key);
}

module.exports = { setCache, getCache, deleteCache };
