// usersService.js
const db = require("./db");
const { getCache, setCache } = require("./cache");

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
 * SELECT (cached)
 */
async function getUsersCached() {
  // try cache
  const cached = getCache(CACHE_KEY);
  if (cached) {
    console.log("⚡ Users from cache");
    return cached;
  }

  // query DB
  console.log("🐢 Users from SQLite");
  const users = await queryAllUsers();

  // cache for 60 seconds
  setCache(CACHE_KEY, users, 60_000);

  return users;
}

/**
 * INSERT user
 */
function insertUser(name, email) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email) VALUES (?, ?)`,
      [name, email],
      function (err) {
        if (err) reject(err);
        else
          resolve({
            id: this.lastID,
            name,
            email
          });
      }
    );
  });
}

/**
 * UPDATE user
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
 * CLEAR CACHE
 */
function invalidateUsersCache() {
  const cache = require("./cache");
  console.log("🧹 Invalidating users cache");
  cache.setCache(CACHE_KEY, null, 1); // tiny TTL OR
  // you can also delete directly:
  // cache.delete(CACHE_KEY)
}

module.exports = {
  getUsersCached,
  insertUser,
  updateUser,
  invalidateUsersCache
};
