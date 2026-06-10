const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendInviteEmail(to, name, link) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: `"Quiniela Mundial 2026 ⚽" <${process.env.EMAIL_USER}>`,
    to,
    subject: '¡Fuiste invitado a la Quiniela del Mundial 2026! 🏆',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1a472a,#2d6a4f);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#ffd700;margin:0;font-size:28px;">⚽ Quiniela Mundial 2026</h1>
        </div>
        <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
          <h2 style="color:#1a472a;">¡Hola, ${name}! 👋</h2>
          <p style="color:#333;font-size:16px;">Has sido invitado a participar en la Quiniela del <strong>Mundial FIFA 2026</strong>.</p>
          <p style="color:#333;font-size:16px;">Ingresa a tu quiniela personal con el siguiente enlace:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${link}" style="background:#ffd700;color:#1a472a;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:18px;display:inline-block;">
              🏆 Ir a mi Quiniela
            </a>
          </div>
          <p style="color:#888;font-size:13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="${link}" style="color:#2d6a4f;">${link}</a></p>
          <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
          <p style="color:#aaa;font-size:12px;text-align:center;">Este proyecto es un ejercicio educativo de Vibe Coding con Windsurf + Cascade.</p>
        </div>
      </div>
    `,
  });
}

async function sendTeamUpdateEmail(to, name, teamName, teamFlag, message) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: `"Quiniela Mundial 2026 ⚽" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Actualización sobre ${teamFlag} ${teamName} — Quiniela Mundial 2026`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1a472a,#2d6a4f);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#ffd700;margin:0;font-size:28px;">⚽ Quiniela Mundial 2026</h1>
        </div>
        <div style="background:#f9f9f9;padding:30px;border-radius:0 0 12px 12px;">
          <h2 style="color:#1a472a;">¡Hola, ${name}! 👋</h2>
          <p style="color:#333;font-size:16px;">Tu equipo favorito <strong>${teamFlag} ${teamName}</strong> tiene una actualización:</p>
          <div style="background:#fff;border-left:4px solid #ffd700;padding:16px;margin:20px 0;border-radius:4px;">
            <p style="margin:0;color:#333;font-size:16px;">${message}</p>
          </div>
          <p style="color:#aaa;font-size:12px;text-align:center;margin-top:20px;">Este proyecto es un ejercicio educativo de Vibe Coding con Windsurf + Cascade.</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendInviteEmail, sendTeamUpdateEmail };
