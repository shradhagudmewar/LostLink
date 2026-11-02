const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  updateUserRole,
  toggleUserBan,
  getAdminItems,
  moderateItem,
  getAdminClaims,
  getActivityLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', toggleUserBan);
router.get('/items', getAdminItems);
router.put('/items/:id/moderate', moderateItem);
router.get('/claims', getAdminClaims);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
