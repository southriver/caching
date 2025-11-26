// usersService.js
const db = require("./db");
const redis = require("./redis");

const CACHE_KEY = "users";

/**
 * Query all users from SQLite
 */
function queryAllUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, name, email FROM users", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * GET (cached via Redis)
 */
async function getUsersCached() {
  // 1. Redis cache lookup
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    console.log("⚡ Users from Redis cache");
    return JSON.parse(cached);
  }

  // 2. SQLite DB query
  console.log("🐢 Users from SQLite");
  const users = await queryAllUsers();

  // 3. Store into Redis (TTL = 60 seconds)
  await redis.set(CACHE_KEY, JSON.stringify(users), { EX: 60 });

  return users;
}

/**
 * INSERT user into SQLite
 */
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

/**
 * UPDATE user in SQLite
 */
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

/**
 * INVALIDATE REDIS CACHE
 */
async function invalidateUsersCache() {
  console.log("🧹 Clearing Redis cache: DEL users");
  await redis.del(CACHE_KEY);
}

module.exports = {
  getUsersCached,
  insertUser,
  updateUser,
  invalidateUsersCache
};
