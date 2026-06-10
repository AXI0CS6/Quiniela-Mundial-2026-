require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getDb } = require('./schema');

const TEAMS = [
  { name: 'Argentina', group_name: 'A', flag: '🇦🇷' },
  { name: 'Australia', group_name: 'A', flag: '🇦🇺' },
  { name: 'España', group_name: 'A', flag: '🇪🇸' },
  { name: 'Marruecos', group_name: 'A', flag: '🇲🇦' },
  { name: 'Francia', group_name: 'B', flag: '🇫🇷' },
  { name: 'Uruguay', group_name: 'B', flag: '🇺🇾' },
  { name: 'Arabia Saudita', group_name: 'B', flag: '🇸🇦' },
  { name: 'Hungría', group_name: 'B', flag: '🇭🇺' },
  { name: 'Brasil', group_name: 'C', flag: '🇧🇷' },
  { name: 'México', group_name: 'C', flag: '🇲🇽' },
  { name: 'Países Bajos', group_name: 'C', flag: '🇳🇱' },
  { name: 'Nueva Zelanda', group_name: 'C', flag: '🇳🇿' },
  { name: 'Alemania', group_name: 'D', flag: '🇩🇪' },
  { name: 'Colombia', group_name: 'D', flag: '🇨🇴' },
  { name: 'Corea del Sur', group_name: 'D', flag: '🇰🇷' },
  { name: 'Costa de Marfil', group_name: 'D', flag: '🇨🇮' },
  { name: 'Portugal', group_name: 'E', flag: '🇵🇹' },
  { name: 'Ecuador', group_name: 'E', flag: '🇪🇨' },
  { name: 'Senegal', group_name: 'E', flag: '🇸🇳' },
  { name: 'Eslovenia', group_name: 'E', flag: '🇸🇮' },
  { name: 'Inglaterra', group_name: 'F', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Japón', group_name: 'F', flag: '🇯🇵' },
  { name: 'Perú', group_name: 'F', flag: '🇵🇪' },
  { name: 'Argelia', group_name: 'F', flag: '🇩🇿' },
  { name: 'Estados Unidos', group_name: 'G', flag: '🇺🇸' },
  { name: 'Bélgica', group_name: 'G', flag: '🇧🇪' },
  { name: 'Ghana', group_name: 'G', flag: '🇬🇭' },
  { name: 'Panamá', group_name: 'G', flag: '🇵🇦' },
  { name: 'Italia', group_name: 'H', flag: '🇮🇹' },
  { name: 'Croacia', group_name: 'H', flag: '🇭🇷' },
  { name: 'Nigeria', group_name: 'H', flag: '🇳🇬' },
  { name: 'Chile', group_name: 'H', flag: '🇨🇱' },
  { name: 'Canadá', group_name: 'I', flag: '🇨🇦' },
  { name: 'Dinamarca', group_name: 'I', flag: '🇩🇰' },
  { name: 'Qatar', group_name: 'I', flag: '🇶🇦' },
  { name: 'Camerún', group_name: 'I', flag: '🇨🇲' },
  { name: 'Suiza', group_name: 'J', flag: '🇨🇭' },
  { name: 'Turquía', group_name: 'J', flag: '🇹🇷' },
  { name: 'República Checa', group_name: 'J', flag: '🇨🇿' },
  { name: 'Togo', group_name: 'J', flag: '🇹🇬' },
  { name: 'Austria', group_name: 'K', flag: '🇦🇹' },
  { name: 'Serbia', group_name: 'K', flag: '🇷🇸' },
  { name: 'Venezuela', group_name: 'K', flag: '🇻🇪' },
  { name: 'Rumanía', group_name: 'K', flag: '🇷🇴' },
  { name: 'Irán', group_name: 'L', flag: '🇮🇷' },
  { name: 'Sudáfrica', group_name: 'L', flag: '🇿🇦' },
  { name: 'Irak', group_name: 'L', flag: '🇮🇶' },
  { name: 'Paraguay', group_name: 'L', flag: '🇵🇾' },
];

// Group stage fixtures - representative set from each group
const FIXTURES = [
  // Group A
  { home: 'Argentina', away: 'Australia', date: '2026-06-11', group_name: 'A' },
  { home: 'España', away: 'Marruecos', date: '2026-06-11', group_name: 'A' },
  { home: 'Argentina', away: 'España', date: '2026-06-16', group_name: 'A' },
  { home: 'Marruecos', away: 'Australia', date: '2026-06-16', group_name: 'A' },
  { home: 'Australia', away: 'España', date: '2026-06-21', group_name: 'A' },
  { home: 'Marruecos', away: 'Argentina', date: '2026-06-21', group_name: 'A' },
  // Group B
  { home: 'Francia', away: 'Uruguay', date: '2026-06-12', group_name: 'B' },
  { home: 'Arabia Saudita', away: 'Hungría', date: '2026-06-12', group_name: 'B' },
  { home: 'Francia', away: 'Arabia Saudita', date: '2026-06-17', group_name: 'B' },
  { home: 'Hungría', away: 'Uruguay', date: '2026-06-17', group_name: 'B' },
  { home: 'Uruguay', away: 'Arabia Saudita', date: '2026-06-22', group_name: 'B' },
  { home: 'Hungría', away: 'Francia', date: '2026-06-22', group_name: 'B' },
  // Group C
  { home: 'Brasil', away: 'México', date: '2026-06-12', group_name: 'C' },
  { home: 'Países Bajos', away: 'Nueva Zelanda', date: '2026-06-12', group_name: 'C' },
  { home: 'Brasil', away: 'Países Bajos', date: '2026-06-17', group_name: 'C' },
  { home: 'Nueva Zelanda', away: 'México', date: '2026-06-17', group_name: 'C' },
  { home: 'México', away: 'Países Bajos', date: '2026-06-22', group_name: 'C' },
  { home: 'Nueva Zelanda', away: 'Brasil', date: '2026-06-22', group_name: 'C' },
  // Group D
  { home: 'Alemania', away: 'Colombia', date: '2026-06-13', group_name: 'D' },
  { home: 'Corea del Sur', away: 'Costa de Marfil', date: '2026-06-13', group_name: 'D' },
  { home: 'Alemania', away: 'Corea del Sur', date: '2026-06-18', group_name: 'D' },
  { home: 'Costa de Marfil', away: 'Colombia', date: '2026-06-18', group_name: 'D' },
  { home: 'Colombia', away: 'Corea del Sur', date: '2026-06-23', group_name: 'D' },
  { home: 'Costa de Marfil', away: 'Alemania', date: '2026-06-23', group_name: 'D' },
  // Group E
  { home: 'Portugal', away: 'Ecuador', date: '2026-06-13', group_name: 'E' },
  { home: 'Senegal', away: 'Eslovenia', date: '2026-06-13', group_name: 'E' },
  { home: 'Portugal', away: 'Senegal', date: '2026-06-18', group_name: 'E' },
  { home: 'Eslovenia', away: 'Ecuador', date: '2026-06-18', group_name: 'E' },
  { home: 'Ecuador', away: 'Senegal', date: '2026-06-23', group_name: 'E' },
  { home: 'Eslovenia', away: 'Portugal', date: '2026-06-23', group_name: 'E' },
  // Group F
  { home: 'Inglaterra', away: 'Japón', date: '2026-06-14', group_name: 'F' },
  { home: 'Perú', away: 'Argelia', date: '2026-06-14', group_name: 'F' },
  { home: 'Inglaterra', away: 'Perú', date: '2026-06-19', group_name: 'F' },
  { home: 'Argelia', away: 'Japón', date: '2026-06-19', group_name: 'F' },
  { home: 'Japón', away: 'Perú', date: '2026-06-24', group_name: 'F' },
  { home: 'Argelia', away: 'Inglaterra', date: '2026-06-24', group_name: 'F' },
  // Group G
  { home: 'Estados Unidos', away: 'Bélgica', date: '2026-06-14', group_name: 'G' },
  { home: 'Ghana', away: 'Panamá', date: '2026-06-14', group_name: 'G' },
  { home: 'Estados Unidos', away: 'Ghana', date: '2026-06-19', group_name: 'G' },
  { home: 'Panamá', away: 'Bélgica', date: '2026-06-19', group_name: 'G' },
  { home: 'Bélgica', away: 'Ghana', date: '2026-06-24', group_name: 'G' },
  { home: 'Panamá', away: 'Estados Unidos', date: '2026-06-24', group_name: 'G' },
  // Group H
  { home: 'Italia', away: 'Croacia', date: '2026-06-15', group_name: 'H' },
  { home: 'Nigeria', away: 'Chile', date: '2026-06-15', group_name: 'H' },
  { home: 'Italia', away: 'Nigeria', date: '2026-06-20', group_name: 'H' },
  { home: 'Chile', away: 'Croacia', date: '2026-06-20', group_name: 'H' },
  { home: 'Croacia', away: 'Nigeria', date: '2026-06-25', group_name: 'H' },
  { home: 'Chile', away: 'Italia', date: '2026-06-25', group_name: 'H' },
  // Group I
  { home: 'Canadá', away: 'Dinamarca', date: '2026-06-15', group_name: 'I' },
  { home: 'Qatar', away: 'Camerún', date: '2026-06-15', group_name: 'I' },
  { home: 'Canadá', away: 'Qatar', date: '2026-06-20', group_name: 'I' },
  { home: 'Camerún', away: 'Dinamarca', date: '2026-06-20', group_name: 'I' },
  { home: 'Dinamarca', away: 'Qatar', date: '2026-06-25', group_name: 'I' },
  { home: 'Camerún', away: 'Canadá', date: '2026-06-25', group_name: 'I' },
  // Group J
  { home: 'Suiza', away: 'Turquía', date: '2026-06-16', group_name: 'J' },
  { home: 'República Checa', away: 'Togo', date: '2026-06-16', group_name: 'J' },
  { home: 'Suiza', away: 'República Checa', date: '2026-06-21', group_name: 'J' },
  { home: 'Togo', away: 'Turquía', date: '2026-06-21', group_name: 'J' },
  { home: 'Turquía', away: 'República Checa', date: '2026-06-26', group_name: 'J' },
  { home: 'Togo', away: 'Suiza', date: '2026-06-26', group_name: 'J' },
  // Group K
  { home: 'Austria', away: 'Serbia', date: '2026-06-16', group_name: 'K' },
  { home: 'Venezuela', away: 'Rumanía', date: '2026-06-16', group_name: 'K' },
  { home: 'Austria', away: 'Venezuela', date: '2026-06-21', group_name: 'K' },
  { home: 'Rumanía', away: 'Serbia', date: '2026-06-21', group_name: 'K' },
  { home: 'Serbia', away: 'Venezuela', date: '2026-06-26', group_name: 'K' },
  { home: 'Rumanía', away: 'Austria', date: '2026-06-26', group_name: 'K' },
  // Group L
  { home: 'Irán', away: 'Sudáfrica', date: '2026-06-17', group_name: 'L' },
  { home: 'Irak', away: 'Paraguay', date: '2026-06-17', group_name: 'L' },
  { home: 'Irán', away: 'Irak', date: '2026-06-22', group_name: 'L' },
  { home: 'Paraguay', away: 'Sudáfrica', date: '2026-06-22', group_name: 'L' },
  { home: 'Sudáfrica', away: 'Irak', date: '2026-06-27', group_name: 'L' },
  { home: 'Paraguay', away: 'Irán', date: '2026-06-27', group_name: 'L' },
];

function seed() {
  const db = getDb();

  const insertTeam = db.prepare(
    'INSERT OR IGNORE INTO teams (name, group_name, flag) VALUES (?, ?, ?)'
  );
  const insertMatch = db.prepare(`
    INSERT OR IGNORE INTO matches (home_team, away_team, match_date, stage, group_name)
    VALUES (?, ?, ?, 'GROUP_STAGE', ?)
  `);

  const seedAll = db.transaction(() => {
    for (const t of TEAMS) insertTeam.run(t.name, t.group_name, t.flag);
    for (const m of FIXTURES) insertMatch.run(m.home, m.away, m.date, m.group_name);
  });

  seedAll();
  console.log(`✅ Seed completado: ${TEAMS.length} equipos, ${FIXTURES.length} partidos.`);
}

seed();
