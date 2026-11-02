const express = require('express');
const router = express.Router();
const {
  submitClaim,
  getMyClaims,
  getItemClaims,
  getClaimById,
  reviewClaimStatus,
  reuniteItem,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { upload, processUploadedFiles } = require('../middleware/uploadMiddleware');

router.post(
  '/',
  protect,
  upload.array('proofImages', 3),
  processUploadedFiles,
  submitClaim
);

router.get('/my', protect, getMyClaims);
router.get('/item/:itemId', protect, getItemClaims);
router.get('/:id', protect, getClaimById);
router.put('/:id/status', protect, reviewClaimStatus);
router.post('/:id/reunite', protect, reuniteItem);

module.exports = router;
