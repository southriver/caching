// app.js
const express = require("express");
const { initRedis, redisSubscriber } = require("./redis");
const { deleteCache } = require("./cache");
const {
  getUsersCached,
  insertUser,
  updateUser,
  invalidateUsersCache,
} = require("./usersService");

const app = express();
app.use(express.json());

(async () => {
  await initRedis();

  // Subscribe to invalidation messages
  await redisSubscriber.subscribe("cache-invalidation", (message) => {
    const payload = JSON.parse(message);
    console.log("🔔 Invalidation message received:", payload);

    if (payload.key) {
      // clear local L1 cache
      deleteCache(payload.key);
    }
  });

  console.log("✅ Subscribed to cache-invalidation channel");
})();

// ---- routes ----

app.get("/users", async (req, res) => {
  try {
    const users = await getUsersCached();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await insertUser(name, email);

    await invalidateUsersCache(); // publish + DEL
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;
    const updated = await updateUser(id, name, email);

    await invalidateUsersCache(); // publish + DEL
    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
