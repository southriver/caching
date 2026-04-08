// db.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./mydb.sqlite", (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err);
  } else {
    console.log("Connected to SQLite DB.");
  }
});

module.exports = db;
