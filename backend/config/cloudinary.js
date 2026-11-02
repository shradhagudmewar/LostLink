const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log(' Cloudinary configured successfully.');
} else {
  console.log(' Cloudinary credentials not detected; using local storage upload fallback.');
}

/**
 * Upload a local file path to Cloudinary
 * @param {string} localFilePath 
 * @param {string} folder 
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadToCloudinary = async (localFilePath, folder = 'lostlink') => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'image',
    });
    // Remove local file after successful Cloudinary upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
};
