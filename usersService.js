// usersService.js
const db = require("./db");
const { setCache, getCache } = require("./cache");

// Wrap sqlite3 all() in a Promise
function queryAllUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, name, email FROM users", [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function getUsersCached() {
  const cacheKey = "users";

  // 1. Try cache
  const cached = getCache(cacheKey);
  if (cached) {
    console.log("Serving users from cache");
    return cached;
  }

  // 2. Fallback to DB
  console.log("Querying users from SQLite");
  const users = await queryAllUsers();

  // 3. Store in cache for 60 seconds
  setCache(cacheKey, users, 60_000);

  return users;
}

module.exports = { getUsersCached };
