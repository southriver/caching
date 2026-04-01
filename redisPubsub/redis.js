// redis.js
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { createClient } = require("redis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const redisClient = createClient({ url: process.env.REDIS_URL });      // normal ops
const redisSubscriber = createClient({ url: process.env.REDIS_URL });  // pub/sub

redisClient.on("error", (err) => console.error("RedisClient error", err));
redisSubscriber.on("error", (err) => console.error("RedisSub error", err));

async function initRedis() {
  if (!redisClient.isOpen) await redisClient.connect();
  if (!redisSubscriber.isOpen) await redisSubscriber.connect();
}

module.exports = {
  redisClient,
  redisSubscriber,
  initRedis,
};
