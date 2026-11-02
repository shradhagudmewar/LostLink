const express = require('express');
const router = express.Router();
const {
  getItemMatches,
  getMyMatches,
  compareItems,
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyMatches);
router.get('/item/:itemId', getItemMatches);
router.post('/compare', compareItems);

module.exports = router;
