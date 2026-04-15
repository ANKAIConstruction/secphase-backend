'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
const fs           = require('fs');

const enquiryRouter = require('./routes/enquiry');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Ensure upload directory exists ───────────────────────────────
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Security headers ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false   // frontend loads from CDN — disable strict CSP for static serving
}));

// ── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'https://www.secphase.com',
  'https://elaborate-wisp-ecf0ab.netlify.app', 
'https://lambent-nougat-9995b4.netlify.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin not allowed — ' + origin));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// ── Rate limiting — anti-spam ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,                            // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// ── Body parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Serve frontend static files ───────────────────────────────────
// The frontend folder sits one level up from backend/
const frontendPath = path.resolve(__dirname, '..', 'frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// ── API routes ────────────────────────────────────────────────────
app.use('/api/enquiry', enquiryRouter);

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Second Phase Backend', timestamp: new Date().toISOString() });
});

// ── Catch-all → serve frontend index.html (SPA fallback) ─────────
app.get('*', (req, res) => {
  const indexFile = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).json({ error: 'Frontend not found' });
  }
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Second Phase Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   SMTP host   : ${process.env.SMTP_HOST || '(not set)'}`);
  console.log(`   Mail to     : ${process.env.MAIL_TO  || '(not set)'}`);
  console.log(`   Upload dir  : ${uploadDir}\n`);
});

module.exports = app;
