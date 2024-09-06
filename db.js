const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function openDb() {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  });
}

async function setup() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
}

module.exports = { openDb, setup };
