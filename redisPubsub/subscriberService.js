const { initRedis, redisSubscriber } = require("./redis");

async function startSubscriber() {
  await initRedis();

  await redisSubscriber.subscribe("cache-invalidation", (message) => {
    try {
      const payload = JSON.parse(message);
      const action = payload.action || "invalidate";
      const changedUser = payload.user
        ? ` | user=${JSON.stringify(payload.user)}`
        : "";

      console.log(
        `[subscriber] ${payload.changedAt || new Date().toISOString()} ${payload.entity}.${action} key=${payload.key}${changedUser}`
      );
    } catch (error) {
      console.error("[subscriber] Failed to parse message:", message, error);
    }
  });

  console.log("[subscriber] Listening on channel: cache-invalidation");
}

startSubscriber().catch((error) => {
  console.error("[subscriber] Startup failed:", error);
  process.exit(1);
});
