// usersService.js
const db = require("./db");
const redis = require("./redis");

function queryAllUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, name, email FROM users", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function getUsersCached() {
  const cacheKey = "users";

  // 1. Check Redis
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("⚡ From Redis cache");
    return JSON.parse(cached);
  }

  // 2. Query SQLite
  console.log("🐢 From SQLite DB");
  const users = await queryAllUsers();

  // 3. Store in Redis for 60 seconds
  await redis.set(cacheKey, JSON.stringify(users), { EX: 60 });

  return users;
}

module.exports = { getUsersCached };
