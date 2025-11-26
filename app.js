// app.js
const express = require("express");
const { getUsersCached } = require("./usersService");

const app = express();

app.get("/users", async (req, res) => {
  try {
    const users = await getUsersCached();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
