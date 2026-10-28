const CacheModel = require('../models/Cache');
const { getIsConnected } = require('../config/db');

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTLMs = 24 * 60 * 60 * 1000; // 24 hours
  }

  normalizeQuery(query) {
    if (!query) return '';
    const clean = query
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_');
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(query.trim().toLowerCase()).digest('hex').slice(0, 8);
    return `${clean}_${hash}`;
  }

  async get(query) {
    const key = this.normalizeQuery(query);
    if (!key) return null;

    // 1. Check MongoDB Cache if DB connected
    if (getIsConnected()) {
      try {
        const cached = await CacheModel.findOne({ key });
        if (cached && cached.expiresAt > new Date()) {
          console.log(`[CAG Cache HIT - MongoDB] key: ${key}`);
          // Increment hit count asynchronously
          CacheModel.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } }).exec();
          return cached.response;
        }
      } catch (err) {
        console.warn(`[CAG Warning] MongoDB cache lookup failed: ${err.message}`);
      }
    }

    // 2. Check In-Memory Cache
    const inMem = this.memoryCache.get(key);
    if (inMem && inMem.expiresAt > Date.now()) {
      console.log(`[CAG Cache HIT - Memory] key: ${key}`);
      return inMem.response;
    }

    console.log(`[CAG Cache MISS] key: ${key}`);
    return null;
  }

  async set(query, response, ttlSeconds = 86400) {
    const key = this.normalizeQuery(query);
    if (!key || !response) return;

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Save in Memory
    this.memoryCache.set(key, {
      response,
      expiresAt: expiresAt.getTime(),
    });

    // Save in MongoDB if connected
    if (getIsConnected()) {
      try {
        await CacheModel.findOneAndUpdate(
          { key },
          { query, response, expiresAt },
          { upsert: true, new: true }
        );
        console.log(`[CAG Cache Stored - MongoDB] key: ${key}`);
      } catch (err) {
        console.warn(`[CAG Warning] Could not store cache in MongoDB: ${err.message}`);
      }
    }
  }

  clear() {
    this.memoryCache.clear();
  }
}

module.exports = new CacheService();
