import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, getLeads } from './db/database.js';
import { runSeed } from './db/seed.js';
import { leadsRouter } from './routes/leads.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Database Schema
initDb();

// Auto-seed if database has no leads yet
try {
  const existing = getLeads({ limit: 1 });
  if (existing.total === 0) {
    console.log('No leads found in database. Running initial seed...');
    runSeed();
  }
} catch (e) {
  console.warn('Auto-seed check warning:', e);
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health') {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint for Ubuntu monitoring / systemd / Docker
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'saasquatch-leadgen-backend'
  });
});

// API Routes
app.use('/api/leads', leadsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'Unknown error'
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 SaaSquatch Deal Engine Backend Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 Leads API: http://localhost:${PORT}/api/leads`);
  console.log(`=========================================`);
});
