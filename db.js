const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Function to open the database
async function openDb() {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  });
}

// Function to setup the database
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

// Export functions
module.exports = { openDb, setup };
