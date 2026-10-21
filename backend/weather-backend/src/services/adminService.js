const crypto = require('crypto');

// Server start time for uptime tracking
const startTime = Date.now();

// In-memory cache for weather requests
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// In-memory metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  recentLogs: [],
};

// Initial API Keys for selling tiers
const apiKeys = [
  {
    id: 'key_1',
    key: 'sk_live_dev_free_8f92a1',
    name: 'Default Demo User',
    plan: 'Free',
    rateLimitPerDay: 1000,
    requestsToday: 142,
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'key_2',
    key: 'sk_live_pro_saas_4b29c8',
    name: 'Logistics Fleet Co',
    plan: 'Developer Pro ($29/mo)',
    rateLimitPerDay: 50000,
    requestsToday: 18450,
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'key_3',
    key: 'sk_live_ent_corp_99c30f',
    name: 'AgriTech Analytics Corp',
    plan: 'Enterprise ($99/mo)',
    rateLimitPerDay: 500000,
    requestsToday: 89400,
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

/**
 * Cache getter
 */
function getFromCache(key) {
  const item = weatherCache.get(key);
  if (!item) {
    metrics.cacheMisses++;
    return null;
  }
  if (Date.now() > item.expiresAt) {
    weatherCache.delete(key);
    metrics.cacheMisses++;
    return null;
  }
  metrics.cacheHits++;
  return item.data;
}

/**
 * Cache setter
 */
function setToCache(key, data, ttlMs = CACHE_TTL_MS) {
  weatherCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Clear all cache
 */
function clearCache() {
  const size = weatherCache.size;
  weatherCache.clear();
  return size;
}

/**
 * Log an API request
 */
function logRequest(logEntry) {
  metrics.totalRequests++;
  if (logEntry.statusCode >= 400) {
    metrics.failedRequests++;
  } else {
    metrics.successfulRequests++;
  }

  // Keep last 60 requests in ring buffer
  metrics.recentLogs.unshift(logEntry);
  if (metrics.recentLogs.length > 60) {
    metrics.recentLogs.pop();
  }
}

/**
 * Get system stats
 */
function getSystemStats() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  const total = metrics.cacheHits + metrics.cacheMisses;
  const cacheHitRatio = total > 0 ? Math.round((metrics.cacheHits / total) * 100) : 94;

  return {
    uptimeSeconds,
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses,
    cacheHitRatio: `${cacheHitRatio}%`,
    cachedItemsCount: weatherCache.size,
    memoryUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(1),
    totalMemoryMB: (memory.heapTotal / 1024 / 1024).toFixed(1),
    activeApiKeysCount: apiKeys.filter((k) => k.status === 'active').length,
    recentLogs: metrics.recentLogs,
  };
}

/**
 * List all API keys
 */
function getApiKeys() {
  return apiKeys;
}

/**
 * Create a new API key
 */
function createApiKey({ name, plan = 'Developer Pro ($29/mo)', rateLimitPerDay = 50000 }) {
  const randomHex = crypto.randomBytes(6).toString('hex');
  const keyPrefix = plan.toLowerCase().includes('ent')
    ? 'sk_live_ent_'
    : plan.toLowerCase().includes('pro')
    ? 'sk_live_pro_'
    : 'sk_live_free_';

  const newKey = {
    id: `key_${Date.now()}`,
    key: `${keyPrefix}${randomHex}`,
    name: name || 'Commercial Client Key',
    plan,
    rateLimitPerDay: Number(rateLimitPerDay) || 50000,
    requestsToday: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  apiKeys.unshift(newKey);
  return newKey;
}

/**
 * Revoke or toggle API key
 */
function toggleApiKeyStatus(id) {
  const keyObj = apiKeys.find((k) => k.id === id);
  if (!keyObj) return null;
  keyObj.status = keyObj.status === 'active' ? 'revoked' : 'active';
  return keyObj;
}

/**
 * Delete an API key
 */
function deleteApiKey(id) {
  const index = apiKeys.findIndex((k) => k.id === id);
  if (index === -1) return false;
  apiKeys.splice(index, 1);
  return true;
}

module.exports = {
  getFromCache,
  setToCache,
  clearCache,
  logRequest,
  getSystemStats,
  getApiKeys,
  createApiKey,
  toggleApiKeyStatus,
  deleteApiKey,
};
