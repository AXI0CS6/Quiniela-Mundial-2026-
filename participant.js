const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');

// Middleware: resolve participant by token
function tokenAuth(req, res, next) {
  const token = req.params.token || req.headers['x-participant-token'];
  if (!token) return res.status(400).json({ error: 'Token requerido' });

  const db = getDb();
  const participant = db.prepare(`
    SELECT p.*, t.name AS team_name, t.flag AS team_flag, t.group_name AS team_group
    FROM participants p
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.token = ?
  `).get(token);

  if (!participant) return res.status(404).json({ error: 'Enlace inválido o expirado' });

  req.participant = participant;
  next();
}

// GET /api/participant/:token — get profile + matches + predictions
router.get('/:token', tokenAuth, (req, res) => {
  const db = getDb();
  const p = req.participant;

  const matches = db.prepare(`
    SELECT m.*,
      pr.home_score AS pred_home, pr.away_score AS pred_away
    FROM matches m
    LEFT JOIN predictions pr ON pr.match_id = m.id AND pr.participant_id = ?
    ORDER BY m.match_date ASC
  `).all(p.id);

  // Leaderboard position
  const leaderboard = getLeaderboard(db);
  const myRank = leaderboard.findIndex(r => r.id === p.id) + 1;
  const myPoints = leaderboard.find(r => r.id === p.id)?.points || 0;

  res.json({
    participant: { ...p, rank: myRank, points: myPoints },
    matches,
    leaderboard,
  });
});

// POST /api/participant/:token/predict — save or update prediction
router.post('/:token/predict', tokenAuth, (req, res) => {
  const { match_id, home_score, away_score } = req.body;
  if (match_id == null || home_score == null || away_score == null) {
    return res.status(400).json({ error: 'match_id, home_score y away_score son requeridos' });
  }

  const db = getDb();
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(match_id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  // Block edits if match already started/finished
  if (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED') {
    return res.status(400).json({ error: 'No puedes modificar predicciones de partidos ya iniciados' });
  }

  db.prepare(`
    INSERT INTO predictions (participant_id, match_id, home_score, away_score)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(participant_id, match_id) DO UPDATE SET
      home_score = excluded.home_score,
      away_score = excluded.away_score
  `).run(req.participant.id, match_id, home_score, away_score);

  res.json({ ok: true });
});

function getLeaderboard(db) {
  const participants = db.prepare(`
    SELECT p.id, p.name, t.name AS team_name, t.flag AS team_flag
    FROM participants p
    LEFT JOIN teams t ON p.team_id = t.id
  `).all();

  const finishedMatches = db.prepare(
    "SELECT * FROM matches WHERE status = 'FINISHED' AND home_score IS NOT NULL"
  ).all();

  return participants.map(p => {
    let points = 0;
    const preds = db.prepare(
      'SELECT * FROM predictions WHERE participant_id = ?'
    ).all(p.id);

    for (const match of finishedMatches) {
      const pred = preds.find(pr => pr.match_id === match.id);
      if (!pred) continue;

      if (pred.home_score === match.home_score && pred.away_score === match.away_score) {
        points += 3; // Exact score
      } else {
        // Check winner
        const actualWinner = match.home_score > match.away_score ? 'H'
          : match.away_score > match.home_score ? 'A' : 'D';
        const predWinner = pred.home_score > pred.away_score ? 'H'
          : pred.away_score > pred.home_score ? 'A' : 'D';
        if (actualWinner === predWinner) points += 1;
      }
    }

    return { ...p, points };
  }).sort((a, b) => b.points - a.points);
}

module.exports = router;
module.exports.getLeaderboard = getLeaderboard;
