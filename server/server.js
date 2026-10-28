const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded properly before any service initialization
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '../.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
}

const { connectDB, getIsConnected, getConnectionError, getActiveDatabaseHost, sanitizeUri } = require('./config/db');
const ragService = require('./services/ragService');

const app = express();

// Initialize MongoDB connection
connectDB();

// Initialize RAG Knowledge Base indexing
ragService.initKnowledgeBase();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/job', require('./routes/jobRoutes'));
app.use('/api/cover-letter', require('./routes/coverLetterRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/career', require('./routes/careerRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  const isConnected = getIsConnected();
  const dbError = getConnectionError();
  const activeHost = getActiveDatabaseHost();

  res.json({
    status: 'online',
    app: 'AI-Powered Resume & Career Assistant',
    database: isConnected ? 'connected' : 'disconnected',
    databaseConnected: isConnected,
    databaseHost: isConnected ? activeHost : null,
    databaseDiagnosis: isConnected ? 'MongoDB connected and verified' : dbError,
    ai: {
      provider: process.env.LLM_PROVIDER || 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api/chat',
      ragDocuments: 7
    },
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend build from client/dist if present
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]', err.stack || err.message || err);
  res.status(err.status || 500).json({
    error: 'InternalServerError',
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

let server = null;
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Career Assistant Backend Server Running on Port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Serving frontend from: ${fs.existsSync(distPath) ? distPath : 'Not built yet (run npm run build in client)'}`);
    console.log(`=======================================================`);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
}

app.server = server;
module.exports = app;
