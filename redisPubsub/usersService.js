// usersService.js
const db = require("./db");
const { setCache, getCache } = require("./cache");
const { redisClient } = require("./redis");

const CACHE_KEY = "users";

function queryAllUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, name, email FROM users", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function getUsersCached() {
  // 1. Try L1 (in-memory) first
  const l1 = getCache(CACHE_KEY);
  if (l1) {
    console.log("⚡ L1 cache hit");
    return l1;
  }

  // 2. Try L2 (Redis)
  const cached = await redisClient.get(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    setCache(CACHE_KEY, parsed, 60_000); // repopulate L1
    console.log("⚡ L2 (Redis) cache hit");
    return parsed;
  }

  // 3. Fallback to DB
  console.log("🐢 DB query");
  const users = await queryAllUsers();

  // Set both caches
  setCache(CACHE_KEY, users, 60_000);
  await redisClient.set(CACHE_KEY, JSON.stringify(users), { EX: 60 });

  return users;
}

function insertUser(name, email) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email) VALUES (?, ?)`,
      [name, email],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, email });
      }
    );
  });
}

function updateUser(id, name, email) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET name=?, email=? WHERE id=?`,
      [name, email, id],
      function (err) {
        if (err) reject(err);
        else resolve({ id, name, email });
      }
    );
  });
}

// 🔑 central invalidation: DEL + PUBLISH
async function invalidateUsersCache() {
  console.log("🧹 Invalidating users cache in Redis and all nodes");

  // 1. Delete from L2
  await redisClient.del(CACHE_KEY);

  // 2. Broadcast to all instances to clear L1
  await redisClient.publish(
    "cache-invalidation",
    JSON.stringify({ key: CACHE_KEY, entity: "users" })
  );
}

module.exports = {
  getUsersCached,
  insertUser,
  updateUser,
  invalidateUsersCache,
};
