const adminService = require('../services/adminService');

function getStats(req, res) {
  try {
    const stats = adminService.getSystemStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function getKeys(req, res) {
  try {
    const keys = adminService.getApiKeys();
    return res.status(200).json({ success: true, data: keys });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function createKey(req, res) {
  try {
    const { name, plan, rateLimitPerDay } = req.body;
    const newKey = adminService.createApiKey({ name, plan, rateLimitPerDay });
    return res.status(201).json({ success: true, data: newKey });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function toggleKey(req, res) {
  try {
    const { id } = req.params;
    const updated = adminService.toggleApiKeyStatus(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Key not found' });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function deleteKey(req, res) {
  try {
    const { id } = req.params;
    const deleted = adminService.deleteApiKey(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Key not found' });
    }
    return res.status(200).json({ success: true, message: 'Key deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function clearCache(req, res) {
  try {
    const count = adminService.clearCache();
    return res.status(200).json({ success: true, message: `Cleared ${count} cached items.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getStats,
  getKeys,
  createKey,
  toggleKey,
  deleteKey,
  clearCache,
};
