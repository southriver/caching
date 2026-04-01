// redis.js
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const { createClient } = require("redis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const client = createClient({
  url: process.env.REDIS_URL
});

client.on("error", (err) => console.error("❌ Redis Error:", err));

(async () => {
  await client.connect();
  console.log("✅ Redis connected");
})();

module.exports = client;
