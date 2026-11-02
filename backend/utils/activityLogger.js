const ActivityLog = require('../models/ActivityLog');

const logActivity = async (action, userId, details = {}, ip = '') => {
  try {
    await ActivityLog.create({
      user: userId || null,
      action,
      details,
      ip,
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = { logActivity };
