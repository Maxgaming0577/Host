require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) { console.error('[FATAL] MONGODB_URI not set in .env'); process.exit(1); }

// ─── DB ────────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 })
  .then(() => console.log('[DB] ✓ Connected to MongoDB Atlas'))
  .catch(err => { console.error('[DB] ✗', err.message); process.exit(1); });
mongoose.connection.on('error', e => console.error('[DB] Error:', e.message));

// ─── SECURITY ──────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true, methods: ['GET','POST','OPTIONS'] }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── SESSIONS ──────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'nexusrewards_dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI, touchAfter: 24 * 3600, ttl: 7 * 24 * 60 * 60 }),
  cookie: { secure: isProd, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' }
}));

// ─── PASSPORT ─────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());
require('./routes/auth'); // registers Discord strategy

// ─── STATIC ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API ROUTES ───────────────────────────────────────────────
const authRouter       = require('./routes/auth');
const redeemRouter     = require('./routes/redeem');
const invoicesRouter   = require('./routes/invoices');
const balanceRouter    = require('./routes/balance');
const leaderboardRouter = require('./routes/leaderboard');

app.use('/auth', authRouter);
app.use('/api/redeem', redeemRouter);
app.use('/api/check-code', redeemRouter);   // shares redeem router (GET /api/check-code/:code)
app.use('/api/invoices', invoicesRouter);
app.use('/api/available-coins', balanceRouter);
app.use('/api/daily-claim', balanceRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.get('/api/stats', (req, res, next) => { req.url = '/stats'; leaderboardRouter(req, res, next); });

// ─── HEALTH ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  uptime: Math.floor(process.uptime()),
  version: '2.0.0',
  auth: req.isAuthenticated ? req.isAuthenticated() : false
}));

// ─── HTML PAGES ────────────────────────────────────────────────
const htmlPages = ['index','earn','redeem','coins','profile','leaderboard','giveaways','how-it-works','about','contact','privacy','terms','shop'];
htmlPages.forEach(p => {
  const url = p === 'index' ? '/' : `/${p}`;
  app.get(url, (req, res) => {
    const f = path.join(__dirname, 'public', p === 'index' ? 'index.html' : `${p}.html`);
    res.sendFile(f, err => { if (err) res.sendFile(path.join(__dirname, 'public', 'index.html')); });
  });
});
app.get('/portal', (req, res) => res.redirect('/coins'));

// ─── 404 / ERROR ──────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((err, req, res, next) => {
  console.error('[ERR]', err.message);
  if (req.path.startsWith('/api/')) return res.status(500).json({ success: false, error: 'Server error.' });
  res.status(500).send('Server error');
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  NexusRewards v2.0  — port ${PORT}       ║`);
  console.log(`║  http://localhost:${PORT}               ║`);
  console.log(`║  Discord OAuth: ${process.env.DISCORD_CLIENT_ID ? '✓ Ready' : '✗ Missing secret'}          ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});
