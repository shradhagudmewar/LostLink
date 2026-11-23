const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['lost', 'found'],
        message: 'Type must be either lost or found',
      },
      required: [true, 'Item type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Documents & IDs',
        'Wallets & Purses',
        'Jewelry & Watches',
        'Keys',
        'Bags & Luggage',
        'Clothing & Accessories',
        'Pets',
        'Other',
      ],
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    primaryColor: {
      type: String,
      required: [true, 'Primary color is required'],
      trim: true,
    },
    secondaryColor: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      specificLocation: {
        type: String,
        required: [true, 'Specific location is required (e.g., Central Park Bench, Metro Gate 2)'],
        trim: true,
      },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    date: {
      type: Date,
      required: [true, 'Date lost or found is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'claimed', 'reunited', 'closed'],
      default: 'active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    securityQuestions: [
      {
        type: String,
        trim: true,
      },
    ],
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    approvedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderationNotes: {
      type: String,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  'location.city': 'text',
  'location.specificLocation': 'text',
});

itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ 'location.city': 1 });
itemSchema.index({ date: -1 });

module.exports = mongoose.model('Item', itemSchema);
