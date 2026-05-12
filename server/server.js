const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./db');
const { sessionMiddleware } = require('./middleware/session');
const { requireAuth } = require('./middleware/auth');

initDb();

const app = express();
const port = process.env.PORT || 8080;
const allowedOrigins = [
  'http://localhost:5173',
  'https://site-rho-one-61.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true); // можно ужесточить позже
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);


app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/uploads', express.static(path.join(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'data', 'uploads'))));

app.use('/api/pow', require('./routes/pow'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/achievements', require('./routes/achievements'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Request error' });
});

const dataDir = path.join(__dirname, '..', 'data', 'uploads');
fs.mkdirSync(dataDir, { recursive: true });

app.listen(port, () => {
  console.log(`Server running on :${port}`);
});
