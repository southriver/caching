// redis.js
const { createClient } = require("redis");

const redisClient = createClient();      // normal ops
const redisSubscriber = createClient();  // pub/sub

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
