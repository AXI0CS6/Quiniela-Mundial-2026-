const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getDb } = require('../db/schema');
const { sendInviteEmail, sendTeamUpdateEmail } = require('../utils/mailer');

// --- Auth middleware ---
function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'] || req.body.password;
  const db = getDb();
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (!setting || password !== setting.value) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  next();
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const db = getDb();
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (setting && password === setting.value) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Contraseña incorrecta' });
});

// GET /api/admin/teams
router.get('/teams', adminAuth, (req, res) => {
  const db = getDb();
  const teams = db.prepare('SELECT * FROM teams ORDER BY group_name, name').all();
  res.json(teams);
});

// GET /api/admin/participants
router.get('/participants', adminAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.id, p.name, p.email, p.token, p.created_at,
           t.name AS team_name, t.flag AS team_flag, t.group_name AS team_group
    FROM participants p
    LEFT JOIN teams t ON p.team_id = t.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(rows);
});

// POST /api/admin/participants — add + invite
router.post('/participants', adminAuth, async (req, res) => {
  const { name, email, team_id } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' });

  const db = getDb();
  const token = uuidv4();

  try {
    db.prepare(
      'INSERT INTO participants (name, email, token, team_id) VALUES (?, ?, ?, ?)'
    ).run(name, email, token, team_id || null);

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const link = `${baseUrl}/quiniela/${token}`;

    let emailSent = false;
    try {
      await sendInviteEmail(email, name, link);
      emailSent = true;
    } catch (mailErr) {
      console.warn('Email no enviado:', mailErr.message);
    }

    const participant = db.prepare('SELECT * FROM participants WHERE token = ?').get(token);
    res.json({ ok: true, participant, link, emailSent });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/participants/:id/team — assign team manually
router.patch('/participants/:id/team', adminAuth, (req, res) => {
  const { team_id } = req.body;
  const db = getDb();
  db.prepare('UPDATE participants SET team_id = ? WHERE id = ?').run(team_id, req.params.id);
  res.json({ ok: true });
});

// POST /api/admin/participants/:id/raffle — assign random team
router.post('/participants/:id/raffle', adminAuth, (req, res) => {
  const db = getDb();
  // Teams already assigned
  const assignedIds = db.prepare(
    'SELECT team_id FROM participants WHERE team_id IS NOT NULL'
  ).all().map(r => r.team_id);

  const allTeams = db.prepare('SELECT id FROM teams').all().map(r => r.id);
  const available = allTeams.filter(id => !assignedIds.includes(id));

  if (available.length === 0) {
    return res.status(400).json({ error: 'Todos los equipos ya han sido asignados' });
  }

  const picked = available[Math.floor(Math.random() * available.length)];
  db.prepare('UPDATE participants SET team_id = ? WHERE id = ?').run(picked, req.params.id);

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(picked);
  res.json({ ok: true, team });
});

// POST /api/admin/sync — sync results from football-data.org
router.post('/sync', adminAuth, async (req, res) => {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'FOOTBALL_API_KEY no configurada en .env' });
  }

  try {
    const response = await axios.get(
      'https://api.football-data.org/v4/competitions/WC/matches',
      { headers: { 'X-Auth-Token': apiKey } }
    );

    const matches = response.data.matches || [];
    const db = getDb();

    const upsertMatch = db.prepare(`
      INSERT INTO matches (api_id, home_team, away_team, match_date, stage, status, home_score, away_score, group_name)
      VALUES (@api_id, @home_team, @away_team, @match_date, @stage, @status, @home_score, @away_score, @group_name)
      ON CONFLICT(api_id) DO UPDATE SET
        status = excluded.status,
        home_score = excluded.home_score,
        away_score = excluded.away_score,
        home_team = excluded.home_team,
        away_team = excluded.away_team,
        match_date = excluded.match_date,
        stage = excluded.stage,
        group_name = excluded.group_name
    `);

    let updated = 0;
    const syncAll = db.transaction(() => {
      for (const m of matches) {
        upsertMatch.run({
          api_id: m.id,
          home_team: m.homeTeam?.name || 'TBD',
          away_team: m.awayTeam?.name || 'TBD',
          match_date: m.utcDate,
          stage: m.stage,
          status: m.status,
          home_score: m.score?.fullTime?.home ?? null,
          away_score: m.score?.fullTime?.away ?? null,
          group_name: m.group || null,
        });
        updated++;
      }
    });
    syncAll();

    // Recalculate points for all predictions
    recalculateAllPoints(db);

    res.json({ ok: true, synced: updated });
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: `Error al sincronizar: ${err.message}` });
  }
});

// GET /api/admin/matches
router.get('/matches', adminAuth, (req, res) => {
  const db = getDb();
  const matches = db.prepare(
    'SELECT * FROM matches ORDER BY match_date ASC'
  ).all();
  res.json(matches);
});

// POST /api/admin/notify/:participantId — notify team advance/elimination
router.post('/notify/:participantId', adminAuth, async (req, res) => {
  const { message } = req.body;
  const db = getDb();
  const p = db.prepare(`
    SELECT p.name, p.email, t.name AS team_name, t.flag
    FROM participants p LEFT JOIN teams t ON p.team_id = t.id
    WHERE p.id = ?
  `).get(req.params.participantId);

  if (!p) return res.status(404).json({ error: 'Participante no encontrado' });

  try {
    await sendTeamUpdateEmail(p.email, p.name, p.team_name, p.flag, message);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function recalculateAllPoints() {
  // Points are computed dynamically in the leaderboard query; no separate table needed.
}

module.exports = router;
