const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');
const { getLeaderboard } = require('./participant');

// GET /api/public/leaderboard
router.get('/leaderboard', (req, res) => {
  const db = getDb();
  const board = getLeaderboard(db);
  res.json(board);
});

// GET /api/public/matches
router.get('/matches', (req, res) => {
  const db = getDb();
  const matches = db.prepare(
    'SELECT * FROM matches ORDER BY match_date ASC'
  ).all();
  res.json(matches);
});

module.exports = router;
