// redis.js
const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.error("❌ Redis Error:", err));

(async () => {
  await client.connect();
  console.log("✅ Redis connected");
})();

module.exports = client;
