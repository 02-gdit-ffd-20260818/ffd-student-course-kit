const express = require('express');
const cors = require('cors');
const { checkDatabase } = require('./database');
const userRoutes = require('./routes/users');
const classRoutes = require('./routes/classes');
const photoWallRoutes = require('./routes/photowall');
const synonymsRoutes = require('./routes/synonyms');
const errorHandler = require('./middleware/errorHandler');

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean);
const app = express();
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));
app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health/live', (req, res) => res.json({ status: 'ok' }));
app.get('/health', async (req, res) => {
  try {
    const database = await checkDatabase();
    res.json({ status: 'ok', database: 'ok', latencyMs: database.latencyMs });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});
app.get('/', (req, res) => res.json({ message: 'PersonaLink API is running' }));
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/photowall', photoWallRoutes);
app.use('/api/synonyms', synonymsRoutes);
app.use((req, res) => res.status(404).json({ message: '请求地址不存在' }));
app.use(errorHandler);

module.exports = app;
