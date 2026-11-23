const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Claim = require('../models/Claim');
const { calculateMatchScore } = require('../utils/smartMatch');
const { logActivity } = require('../utils/activityLogger');

const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      city,
      status,
      search,
      brand,
      color,
      startDate,
      endDate,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (!req.user || req.user.role !== 'admin') {
      query.isSuspicious = false;
    }

    if (type) query.type = type;
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (color) {
      query.$or = [
        { primaryColor: { $regex: color, $options: 'i' } },
        { secondaryColor: { $regex: color, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { 'location.city': searchRegex },
        { 'location.specificLocation': searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email avatar reputationScore')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      items,
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email avatar phone studentId reputationScore')
      .populate({
        path: 'approvedClaim',
        populate: { path: 'claimant', select: 'name email phone studentId avatar reputationScore' },
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    // Dynamic fallback if item is marked claimed or reunited
    if (!item.approvedClaim && (item.status === 'claimed' || item.status === 'reunited')) {
      const activeClaim = await Claim.findOne({
        item: item._id,
        status: { $in: ['approved', 'reunited'] },
      }).populate('claimant', 'name email phone studentId avatar reputationScore');
      if (activeClaim) {
        item = item.toObject();
        item.approvedClaim = activeClaim;
      }
    }

    item.views = (item.views || 0) + 1;
    if (typeof item.save === 'function') {
      await item.save();
    } else {
      await Item.findByIdAndUpdate(item._id, { $inc: { views: 1 } });
    }

    let userClaim = null;
    if (req.user) {
      userClaim = await Claim.findOne({
        item: item._id,
        claimant: req.user._id,
      });
    }

    const claimsCount = await Claim.countDocuments({ item: item._id });

    res.status(200).json({
      success: true,
      item,
      userClaim,
      claimsCount,
    });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const {
      title,
      type,
      category,
      brand,
      primaryColor,
      secondaryColor,
      city,
      specificLocation,
      date,
      description,
      securityQuestions,
    } = req.body;

    if (!title || !type || !category || !primaryColor || !city || !specificLocation || !date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    let images = [];
    if (req.processedImages && req.processedImages.length > 0) {
      images = req.processedImages;
    } else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    }

    let parsedQuestions = [];
    if (securityQuestions) {
      if (Array.isArray(securityQuestions)) {
        parsedQuestions = securityQuestions;
      } else if (typeof securityQuestions === 'string') {
        try {
          parsedQuestions = JSON.parse(securityQuestions);
        } catch (e) {
          parsedQuestions = securityQuestions.split('\n').filter(Boolean);
        }
      }
    }

    const item = await Item.create({
      title,
      type,
      category,
      brand: brand || '',
      primaryColor,
      secondaryColor: secondaryColor || '',
      location: {
        city,
        specificLocation,
      },
      date: new Date(date),
      description,
      images,
      securityQuestions: parsedQuestions,
      reportedBy: req.user._id,
      status: 'active',
    });

    await logActivity(
      'ITEM_REPORTED',
      req.user._id,
      { itemId: item._id, title: item.title, type: item.type },
      req.ip
    );

    // Run smart match and notify
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const candidateQuery = {
      type: oppositeType,
      status: 'active',
      isSuspicious: false,
      _id: { $ne: item._id },
    };

    const candidates = await Item.find(candidateQuery).populate('reportedBy', 'name email');
    let highMatchesCount = 0;

    for (const candidate of candidates) {
      const matchResult = calculateMatchScore(item, candidate);

      if (matchResult.score >= 60) {
        highMatchesCount++;

        await Notification.create({
          recipient: req.user._id,
          type: 'match_found',
          title: `Potential Match (${matchResult.score}%): ${candidate.title}`,
          message: `Your ${item.type} report "${item.title}" matched with a ${candidate.type} item in ${candidate.location.city}.`,
          relatedItem: candidate._id,
          metadata: {
            score: matchResult.score,
            oppositeItemId: candidate._id,
            oppositeTitle: candidate.title,
            matchedReasons: matchResult.reasons,
          },
        });

        if (candidate.reportedBy && candidate.reportedBy._id.toString() !== req.user._id.toString()) {
          await Notification.create({
            recipient: candidate.reportedBy._id,
            type: 'match_found',
            title: `Potential Match (${matchResult.score}%): ${item.title}`,
            message: `A newly reported ${item.type} item "${item.title}" in ${item.location.city} matches your report.`,
            relatedItem: item._id,
            metadata: {
              score: matchResult.score,
              oppositeItemId: item._id,
              oppositeTitle: item.title,
              matchedReasons: matchResult.reasons,
            },
          });
        }
      }
    }

    const populatedItem = await Item.findById(item._id).populate(
      'reportedBy',
      'name email avatar reputationScore'
    );

    res.status(201).json({
      success: true,
      item: populatedItem,
      highMatchesCount,
      message: `Report submitted successfully! Found ${highMatchesCount} potential instant matches.`,
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

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
        message: 'Not authorized to update this report.',
      });
    }

    const {
      title,
      category,
      brand,
      primaryColor,
      secondaryColor,
      city,
      specificLocation,
      date,
      description,
      status,
      securityQuestions,
    } = req.body;

    if (title) item.title = title;
    if (category) item.category = category;
    if (brand !== undefined) item.brand = brand;
    if (primaryColor) item.primaryColor = primaryColor;
    if (secondaryColor !== undefined) item.secondaryColor = secondaryColor;
    if (city) item.location.city = city;
    if (specificLocation) item.location.specificLocation = specificLocation;
    if (date) item.date = new Date(date);
    if (description) item.description = description;
    if (status) item.status = status;

    if (req.processedImages && req.processedImages.length > 0) {
      item.images = [...item.images, ...req.processedImages];
    }

    if (securityQuestions) {
      if (Array.isArray(securityQuestions)) {
        item.securityQuestions = securityQuestions;
      } else if (typeof securityQuestions === 'string') {
        try {
          item.securityQuestions = JSON.parse(securityQuestions);
        } catch (e) {
          item.securityQuestions = securityQuestions.split('\n').filter(Boolean);
        }
      }
    }

    const updated = await item.save();

    await logActivity('ITEM_UPDATED', req.user._id, { itemId: item._id }, req.ip);

    res.status(200).json({
      success: true,
      item: updated,
      message: 'Item updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

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
        message: 'Not authorized to delete this report.',
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    await Claim.deleteMany({ item: req.params.id });

    await logActivity('ITEM_DELETED', req.user._id, { itemId: req.params.id }, req.ip);

    res.status(200).json({
      success: true,
      message: 'Report and associated claims deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    let items = await Item.find({ reportedBy: req.user._id })
      .populate({
        path: 'approvedClaim',
        populate: { path: 'claimant', select: 'name email phone studentId avatar' },
      })
      .sort('-createdAt');

    // Attach approved claim for any claimed item if not linked directly
    items = await Promise.all(
      items.map(async (doc) => {
        const it = doc.toObject();
        if (!it.approvedClaim && (it.status === 'claimed' || it.status === 'reunited')) {
          const cl = await Claim.findOne({
            item: it._id,
            status: { $in: ['approved', 'reunited'] },
          }).populate('claimant', 'name email phone studentId avatar');
          if (cl) it.approvedClaim = cl;
        }
        return it;
      })
    );

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyReports,
};
