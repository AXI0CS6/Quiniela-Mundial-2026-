require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const { getDb } = require('./db/schema');

const adminRoutes = require('./routes/admin');
const participantRoutes = require('./routes/participant');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Init DB
getDb();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/public', publicRoutes);

// SPA fallback for frontend pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/quiniela/:token', (req, res) => res.sendFile(path.join(__dirname, 'public', 'quiniela.html')));
app.get('/tabla', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tabla.html')));

app.listen(PORT, () => {
  console.log(`⚽ Quiniela Mundial 2026 corriendo en http://localhost:${PORT}`);
});
