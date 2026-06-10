[README.md](https://github.com/user-attachments/files/28813533/README.md)
# ⚽ Quiniela Mundial 2026 — Ejercicio de Aprendizaje

## ⚠️ AVISO IMPORTANTE

> Este proyecto es un ejercicio práctico de aprendizaje desarrollado con
> **Windsurf + Cascade** como demostración de las capacidades del **Vibe Coding**
> y el desarrollo asistido por IA. No tiene fines comerciales ni competitivos.
> Fue construido en el contexto de la sesión **KT_MxDC: Vibe Coding +
> Windsurf + No Tec? No Prob!** como ejemplo educativo de prompt engineering
> y generación de código con inteligencia artificial.

---

## 📋 Descripción

Aplicación web completa para gestionar una quiniela del **Mundial FIFA 2026**.
Incluye panel de administración, acceso por enlace único para participantes,
tabla de posiciones pública y sincronización automática de resultados desde
la API de football-data.org.

---

## 🚀 Instalación y Configuración

### Requisitos
- **Node.js** v18 o superior
- **npm** v9 o superior

### 1. Clona el repositorio

```bash
git clone <url-del-repositorio>
cd quiniela2026
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp .env.example .env
```

Abre `.env` y rellena:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default `3000`) |
| `BASE_URL` | URL pública de la app (ej. `http://localhost:3000`) |
| `FOOTBALL_API_KEY` | API Key de football-data.org |
| `EMAIL_HOST` | Host SMTP (ej. `smtp.gmail.com`) |
| `EMAIL_PORT` | Puerto SMTP (`587` para Gmail) |
| `EMAIL_SECURE` | `false` para TLS / `true` para SSL |
| `EMAIL_USER` | Tu dirección de correo |
| `EMAIL_PASS` | Contraseña de aplicación |

### 4. Carga el fixture inicial (48 equipos + 72 partidos)

```bash
npm run seed
```

### 5. Inicia el servidor

```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Cómo obtener la API Key gratuita de football-data.org

1. Ve a [https://www.football-data.org/client/register](https://www.football-data.org/client/register)
2. Regístrate con tu email y activa tu cuenta
3. Copia tu **API Token** desde el panel de usuario
4. Pégalo en tu `.env` como `FOOTBALL_API_KEY=tu_token`

> El plan gratuito permite **10 solicitudes/minuto** y acceso al endpoint
> `/v4/competitions/WC/matches` con resultados del Mundial.

---

## 📧 Configurar envío de correos con Gmail

1. Activa la **verificación en 2 pasos** en tu cuenta Google
2. Ve a [Contraseñas de aplicación](https://myaccount.google.com/apppasswords)
3. Crea una contraseña para "Otra aplicación → Quiniela 2026"
4. Copia la contraseña de 16 caracteres generada
5. Ponla en `.env` como `EMAIL_PASS=abcd efgh ijkl mnop`

---

## 📂 Estructura del Proyecto

```
quiniela2026/
├── db/
│   ├── schema.js        # Definición de tablas SQLite
│   └── seed.js          # Carga inicial: 48 equipos + 72 partidos
├── public/
│   ├── index.html       # Página principal
│   ├── admin.html       # Panel de administración
│   ├── quiniela.html    # Quiniela del participante (vía token)
│   ├── tabla.html       # Tabla de posiciones pública
│   ├── style.css        # Estilos globales
│   └── utils.js         # Helpers JS (fetch, toast, formato)
├── routes/
│   ├── admin.js         # Rutas protegidas del admin
│   ├── participant.js   # Rutas del participante + scoring
│   └── public.js        # Tabla pública + partidos
├── utils/
│   └── mailer.js        # Nodemailer: invitaciones + notificaciones
├── server.js            # Servidor Express principal
├── .env.example         # Plantilla de variables de entorno
├── .gitignore
└── package.json
```

---

## 🏆 Sistema de Puntuación

| Resultado | Puntos |
|---|---|
| Marcador exacto (ej. predijiste 2-1 y fue 2-1) | **3 pts** |
| Acertar ganador o empate | **1 pt** |
| Fallo total | **0 pts** |

---

## 🔐 Acceso Admin por Default

- **URL:** `http://localhost:3000/admin`
- **Contraseña:** `admin2026`

> Puedes cambiarla directamente en la base de datos SQLite:
> ```sql
> UPDATE settings SET value = 'nueva_contraseña' WHERE key = 'admin_password';
> ```

---

## 📱 Rutas de la App

| Ruta | Descripción |
|---|---|
| `/` | Página principal |
| `/admin` | Panel de administrador |
| `/quiniela/:token` | Quiniela personal del participante |
| `/tabla` | Tabla de posiciones pública |

### API REST

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/admin/login` | Autenticación admin |
| `GET` | `/api/admin/participants` | Lista de participantes |
| `POST` | `/api/admin/participants` | Agregar e invitar participante |
| `PATCH` | `/api/admin/participants/:id/team` | Asignar equipo manualmente |
| `POST` | `/api/admin/participants/:id/raffle` | Sortear equipo aleatorio |
| `POST` | `/api/admin/sync` | Sincronizar resultados con API |
| `POST` | `/api/admin/notify/:id` | Enviar notificación de equipo |
| `GET` | `/api/participant/:token` | Perfil + partidos + predicciones |
| `POST` | `/api/participant/:token/predict` | Guardar predicción |
| `GET` | `/api/public/leaderboard` | Tabla de posiciones pública |
| `GET` | `/api/public/matches` | Partidos con resultados |

---

*Construido con ❤️ usando Windsurf + Cascade · Vibe Coding · KT_MxDC 2026*
