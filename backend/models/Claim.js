const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required'],
    },
    proofDescription: {
      type: String,
      required: [true, 'Please provide detailed proof of ownership (serial numbers, unique marks, purchase info)'],
      trim: true,
      maxlength: [2000, 'Proof description cannot exceed 2000 characters'],
    },
    proofImages: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
      },
    ],
    securityAnswers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'reunited'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);
