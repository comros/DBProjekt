const ActivityLog = require('../models/mongo/ActivityLog');

const log = async (req, action, payload = {}) => {
  try {
    await ActivityLog.create({
      user_id: req.session?.userId || null,
      action,
      payload,
      ip: req.ip
    });
  } catch (e) {
    console.error('Logger error:', e.message);
  }
};

module.exports = log;
