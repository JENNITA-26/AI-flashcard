// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate.js';
import decksRouter from './routes/decks.js';
import analyticsRouter from './routes/analytics.js';
import { isSupabaseConfigured } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const geminiReady =
    Boolean(process.env.GEMINI_API_KEY) &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  const supabaseReady = isSupabaseConfigured();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      geminiConfigured: geminiReady,
      supabaseConfigured: supabaseReady,
    },
  });
});

// Protected API Routes
app.use('/api/generate', generateRouter);
app.use('/api', decksRouter); // Mounts /api/decks, /api/flashcards/:id/difficulty, /api/quiz/submit
app.use('/api/analytics', analyticsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`=========================================================`);
  console.log(`🚀 AI Flashcard & Quiz Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================================`);
});

