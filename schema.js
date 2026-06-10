const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'quiniela.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      group_name TEXT,
      flag TEXT
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL UNIQUE,
      team_id INTEGER REFERENCES teams(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_id INTEGER UNIQUE,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      match_date TEXT,
      stage TEXT DEFAULT 'GROUP_STAGE',
      status TEXT DEFAULT 'SCHEDULED',
      home_score INTEGER,
      away_score INTEGER,
      group_name TEXT
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL REFERENCES participants(id),
      match_id INTEGER NOT NULL REFERENCES matches(id),
      home_score INTEGER,
      away_score INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(participant_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const existing = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (!existing) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', 'admin2026')").run();
  }
}

module.exports = { getDb };
