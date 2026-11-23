const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');

const submitClaim = async (req, res, next) => {
  try {
    const {
      itemId,
      proofDescription,
      securityAnswers,
      contactPhone,
      contactEmail,
    } = req.body;

    if (!itemId || !proofDescription) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and detailed proof of ownership are required.',
      });
    }

    const item = await Item.findById(itemId).populate('reportedBy', 'name email');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    if (item.reportedBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim an item that you reported yourself.',
      });
    }

    if (item.status === 'reunited' || item.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This item is no longer available for claims (already returned or closed).',
      });
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: `You already have an active (${existingClaim.status}) claim on this item.`,
      });
    }

    let proofImages = [];
    if (req.processedImages && req.processedImages.length > 0) {
      proofImages = req.processedImages;
    } else if (req.body.proofImages && Array.isArray(req.body.proofImages)) {
      proofImages = req.body.proofImages;
    }

    let parsedAnswers = [];
    if (securityAnswers) {
      if (Array.isArray(securityAnswers)) {
        parsedAnswers = securityAnswers;
      } else if (typeof securityAnswers === 'string') {
        try {
          parsedAnswers = JSON.parse(securityAnswers);
        } catch (e) {
          parsedAnswers = [];
        }
      }
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      proofDescription,
      proofImages,
      securityAnswers: parsedAnswers,
      contactPhone: contactPhone || req.user.phone || '',
      contactEmail: contactEmail || req.user.email || '',
      status: 'pending',
    });

    await Notification.create({
      recipient: item.reportedBy._id,
      type: 'claim_submitted',
      title: `New Claim Submitted: ${item.title}`,
      message: `${req.user.name} submitted an ownership claim for your report "${item.title}".`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      metadata: { claimantName: req.user.name },
    });

    await logActivity(
      'CLAIM_SUBMITTED',
      req.user._id,
      { claimId: claim._id, itemId: item._id },
      req.ip
    );

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item')
      .populate('claimant', 'name email avatar');

    res.status(201).json({
      success: true,
      claim: populatedClaim,
      message: 'Claim submitted successfully! The finder and admins have been notified.',
    });
  } catch (error) {
    next(error);
  }
};

const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        populate: { path: 'reportedBy', select: 'name email phone avatar' },
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

const getItemClaims = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    if (
      item.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view claims for this item.',
      });
    }

    const claims = await Claim.find({ item: itemId })
      .populate('claimant', 'name email phone studentId avatar reputationScore')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email phone avatar reputationScore')
      .populate('reviewedBy', 'name');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isReporter =
      claim.item && claim.item.reportedBy && claim.item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim.',
      });
    }

    res.status(200).json({
      success: true,
      claim,
    });
  } catch (error) {
    next(error);
  }
};

const reviewClaimStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected".',
      });
    }

    const claim = await Claim.findById(req.params.id).populate('item claimant');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    const isReporter =
      claim.item && claim.item.reportedBy && claim.item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this claim.',
      });
    }

    claim.status = status;
    claim.adminNotes = adminNotes || (isAdmin ? 'Verified by Admin as genuine owner' : claim.adminNotes);
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    const claimantName = claim.claimant?.name || 'Claimant';
    const claimantPhone = claim.contactPhone || claim.claimant?.phone || 'Contact not provided';
    const claimantEmail = claim.contactEmail || claim.claimant?.email || '';

    // Fetch finder details
    const finderUser = claim.item?.reportedBy ? await User.findById(claim.item.reportedBy) : null;

    if (status === 'approved' && claim.item) {
      await Item.findByIdAndUpdate(claim.item._id, {
        status: 'claimed',
        approvedClaim: claim._id,
        claimedBy: claim.claimant._id,
      });

      // 1. Send High-Priority Notification to the Student who Found & Reported the Item
      if (claim.item.reportedBy && claim.item.reportedBy.toString() !== claim.claimant._id.toString()) {
        await Notification.create({
          recipient: claim.item.reportedBy,
          type: 'claim_status_update',
          title: `✅ Real Owner Verified: ${claim.item.title}`,
          message: `Admin has verified that ${claimantName} is the real/genuine owner of "${claim.item.title}". Please submit / handover the item to them. Owner Phone: 📞 ${claimantPhone}${claimantEmail ? ` | ✉️ ${claimantEmail}` : ''}.`,
          relatedItem: claim.item._id,
          relatedClaim: claim._id,
          metadata: {
            status: 'approved',
            isOwnerVerified: true,
            claimantName,
            claimantPhone,
            claimantEmail,
            actionRequired: 'handover_to_owner',
            adminNotes: claim.adminNotes,
          },
        });
      }

      // 2. Notify Claimant that Claim is Approved and Finder will Hand Over the Item
      await Notification.create({
        recipient: claim.claimant._id,
        type: 'claim_status_update',
        title: `🎉 Claim Approved: ${claim.item.title}`,
        message: `Your ownership claim for "${claim.item.title}" has been approved! The finder (${finderUser ? finderUser.name : 'student'}) has been instructed to handover the item to you.${
          finderUser?.phone ? ` Finder Phone: 📞 ${finderUser.phone}` : ''
        }`,
        relatedItem: claim.item._id,
        relatedClaim: claim._id,
        metadata: {
          status: 'approved',
          adminNotes: claim.adminNotes,
          finderName: finderUser?.name,
          finderPhone: finderUser?.phone,
        },
      });
    } else if (status === 'rejected' && claim.item) {
      // Revert item status if it was previously claimed
      const currentItem = await Item.findById(claim.item._id);
      if (currentItem && currentItem.approvedClaim && currentItem.approvedClaim.toString() === claim._id.toString()) {
        currentItem.status = 'active';
        currentItem.approvedClaim = undefined;
        currentItem.claimedBy = undefined;
        await currentItem.save();
      }

      await Notification.create({
        recipient: claim.claimant._id,
        type: 'claim_status_update',
        title: `Claim Rejected: ${claim.item.title}`,
        message: `Your ownership claim for "${claim.item.title}" was not approved.${
          adminNotes ? ` Reason: "${adminNotes}"` : ''
        }`,
        relatedItem: claim.item._id,
        relatedClaim: claim._id,
        metadata: { status: 'rejected', adminNotes },
      });
    }

    await logActivity(
      'CLAIM_REVIEWED',
      req.user._id,
      { claimId: claim._id, status, claimantId: claim.claimant._id },
      req.ip
    );

    res.status(200).json({
      success: true,
      claim,
      message: `Claim successfully ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

const reuniteItem = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item claimant');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    const isReporter =
      claim.item && claim.item.reportedBy && claim.item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to finalize return for this item.',
      });
    }

    claim.status = 'reunited';
    await claim.save();

    await Item.findByIdAndUpdate(claim.item._id, { status: 'reunited' });

    await User.findByIdAndUpdate(claim.claimant._id, {
      $inc: { reputationScore: 15 },
    });
    if (claim.item.reportedBy) {
      await User.findByIdAndUpdate(claim.item.reportedBy, {
        $inc: { reputationScore: 20 },
      });
    }

    await Notification.create({
      recipient: claim.claimant._id,
      type: 'item_reunited',
      title: ` Item Returned: ${claim.item.title}`,
      message: `Congratulations! Your item "${claim.item.title}" has been marked as returned. +15 reputation points awarded!`,
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    if (claim.item.reportedBy.toString() !== claim.claimant._id.toString()) {
      await Notification.create({
        recipient: claim.item.reportedBy,
        type: 'item_reunited',
        title: ` Item Successfully Returned!`,
        message: `Thank you for returning "${claim.item.title}" to its rightful owner. +20 reputation points awarded!`,
        relatedItem: claim.item._id,
        relatedClaim: claim._id,
      });
    }

    await logActivity(
      'ITEM_REUNITED',
      req.user._id,
      { claimId: claim._id, itemId: claim.item._id },
      req.ip
    );

    res.status(200).json({
      success: true,
      message: 'Item has been successfully marked as returned! Reputation points awarded.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getItemClaims,
  getClaimById,
  reviewClaimStatus,
  reuniteItem,
};
