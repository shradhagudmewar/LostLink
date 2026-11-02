const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyReports,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload, processUploadedFiles } = require('../middleware/uploadMiddleware');

router.get('/my-reports', protect, getMyReports);

router
  .route('/')
  .get(optionalAuth, getItems)
  .post(protect, upload.array('images', 5), processUploadedFiles, createItem);

router
  .route('/:id')
  .get(optionalAuth, getItemById)
  .put(protect, upload.array('images', 5), processUploadedFiles, updateItem)
  .delete(protect, deleteItem);

module.exports = router;
