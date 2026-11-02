const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

const processUploadedFiles = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const filesToProcess = req.files
    ? Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat()
    : [req.file];

  const processedImages = [];

  try {
    for (const file of filesToProcess) {
      if (isCloudinaryConfigured) {
        try {
          const cloudResult = await uploadToCloudinary(file.path, 'lostlink/items');
          processedImages.push({
            url: cloudResult.url,
            public_id: cloudResult.public_id,
          });
        } catch (cloudErr) {
          console.warn('Cloudinary upload failed, using local file path:', cloudErr.message);
          processedImages.push({
            url: `/uploads/${file.filename}`,
            public_id: file.filename,
          });
        }
      } else {
        processedImages.push({
          url: `/uploads/${file.filename}`,
          public_id: file.filename,
        });
      }
    }

    req.processedImages = processedImages;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  processUploadedFiles,
};
