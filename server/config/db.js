const mongoose = require('mongoose');

let isConnected = false;
let connectionError = null;
let activeDatabaseHost = null;

/**
 * Safely masks credentials in MongoDB connection string for logging
 */
const sanitizeUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
};

/**
 * Validates MongoDB URI format without exposing credentials
 */
const validateUriFormat = (uri) => {
  if (!uri || typeof uri !== 'string' || uri.trim().length === 0) {
    return {
      valid: false,
      reason: 'MONGODB_URI is empty or undefined. Please set MONGODB_URI in server/.env.'
    };
  }

  const trimmed = uri.trim();
  const isAtlas = trimmed.startsWith('mongodb+srv://');
  const isStandard = trimmed.startsWith('mongodb://');

  if (!isAtlas && !isStandard) {
    return {
      valid: false,
      reason: 'Invalid protocol. MONGODB_URI must begin with "mongodb+srv://" (for Atlas) or "mongodb://" (for local/standard).'
    };
  }

  // Check for common placeholders
  const placeholderMatches = trimmed.match(/(YOUR_ACTUAL_PASSWORD|<password>|<YOUR_PASSWORD>|YOUR_PASSWORD|<db_password>)/i);
  if (placeholderMatches) {
    return {
      valid: false,
      placeholder: placeholderMatches[0],
      reason: `Placeholder "${placeholderMatches[0]}" detected in MONGODB_URI. Replace it with your actual MongoDB database user password.`
    };
  }

  return { valid: true, isAtlas, isStandard };
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    activeDatabaseHost = mongoose.connection.host;
    return mongoose.connection;
  }

  // Read MONGODB_URI (falling back to MONGO_URI if set)
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  const validation = validateUriFormat(rawUri);

  if (!validation.valid) {
    isConnected = false;
    connectionError = validation.reason;
    activeDatabaseHost = null;

    console.error('================================================================');
    console.error('[MongoDB Error] Database connection failed: Invalid Configuration');
    console.error(`- Reason: ${validation.reason}`);
    console.error(`- Configured URI format: ${sanitizeUri(rawUri) || '(none)'}`);
    console.error('- Required Action:');
    if (validation.placeholder) {
      console.error(`  1. Open "server/.env" in your editor.`);
      console.error(`  2. Replace "${validation.placeholder}" with your actual MongoDB Atlas database user password.`);
      console.error(`  3. Ensure Network Access in MongoDB Atlas allows your IP (or 0.0.0.0/0).`);
      console.error(`  4. Alternatively, for local MongoDB, set: MONGODB_URI=mongodb://127.0.0.1:27017/ai_resume_assistant`);
    } else {
      console.error(`  1. Define MONGODB_URI in "server/.env".`);
      console.error(`  2. Reference "server/.env.example" for the expected format.`);
    }
    console.error('================================================================');
    return null;
  }

  const maskedUri = sanitizeUri(rawUri);

  try {
    console.log(`[MongoDB] Attempting connection to: ${maskedUri}`);

    const conn = await mongoose.connect(rawUri.trim(), {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    connectionError = null;
    activeDatabaseHost = conn.connection.host;

    console.log('================================================================');
    console.log(`[MongoDB Success] Connected to database server.`);
    console.log(`- Host: ${conn.connection.host}`);
    console.log(`- Database: ${conn.connection.name}`);
    console.log(`- Target: ${maskedUri}`);
    console.log('================================================================');

    return conn;
  } catch (error) {
    isConnected = false;
    activeDatabaseHost = null;

    let friendlyDiagnosis = error.message;

    if (error.message.includes('tlsv1 alert internal error') || error.name === 'MongooseServerSelectionError') {
      friendlyDiagnosis = 'Could not establish connection to MongoDB Atlas. Most common causes: (1) Your current IP address is not whitelisted in MongoDB Atlas Network Access (whitelist 0.0.0.0/0 for development). (2) Incorrect database user credentials.';
    } else if (error.message.includes('Authentication failed')) {
      friendlyDiagnosis = 'MongoDB Atlas authentication failed. The username or password specified in server/.env is incorrect.';
    } else if (error.message.includes('ECONNREFUSED')) {
      friendlyDiagnosis = 'Connection refused. If using local MongoDB, ensure the mongod service is active on port 27017.';
    }

    connectionError = friendlyDiagnosis;

    console.error('================================================================');
    console.error('[MongoDB Error] Connection attempt failed:');
    console.error(`- Target: ${maskedUri}`);
    console.error(`- Diagnosis: ${friendlyDiagnosis}`);
    console.error(`- Technical error: [${error.name}] ${error.message}`);
    console.error('================================================================');

    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Connection dropped or disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  connectionError = null;
  console.log('[MongoDB] Connection re-established.');
});

const getIsConnected = () => isConnected;
const getConnectionError = () => connectionError;
const getActiveDatabaseHost = () => activeDatabaseHost;

/**
 * Middleware: requireDatabase
 * Halts requests requiring persistent storage when MongoDB is not connected.
 */
const requireDatabase = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: connectionError || 'MongoDB is currently disconnected. Cannot complete persistent database operations. Please configure MONGODB_URI in server/.env.',
      databaseStatus: 'disconnected',
      hint: 'Verify your MongoDB Atlas password and Network Access IP whitelist in server/.env, or run a local MongoDB instance.'
    });
  }
  next();
};

module.exports = {
  connectDB,
  getIsConnected,
  getConnectionError,
  getActiveDatabaseHost,
  requireDatabase,
  sanitizeUri,
  validateUriFormat
};
