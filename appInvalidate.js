// app.js
const express = require("express");
const bodyParser = require("body-parser");

const { getUsersCached, invalidateUsersCache, insertUser, updateUser } =
  require("./usersServiceRedisInvalidate");
// use usersServiceRedisInvalidate for redis
const app = express();
app.use(express.json());
app.use(bodyParser.json());

/**
 * GET /users
 * → returns cached results (60s TTL)
 */
app.get("/users", async (req, res) => {
  try {
    const users = await getUsersCached();
    res.json(users);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /users
 * → insert into SQLite
 * → invalidate cache
 */
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    const newUser = await insertUser(name, email);

    // Important: Invalidate cache
    invalidateUsersCache();

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Insert failed" });
  }
});

/**
 * PUT /users/:id
 * → update into SQLite
 * → invalidate cache
 */
app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;

    const updated = await updateUser(id, name, email);

    // Invalidate cache after update
    invalidateUsersCache();

    res.json({ success: true, updated });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
