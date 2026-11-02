const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../utils/activityLogger');

const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const totalItems = totalLost + totalFound;

    const totalActive = await Item.countDocuments({ status: 'active' });
    const totalClaimed = await Item.countDocuments({ status: 'claimed' });
    const totalReunited = await Item.countDocuments({ status: 'reunited' });

    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const approvedClaims = await Claim.countDocuments({ status: 'approved' });
    const suspiciousItems = await Item.countDocuments({ isSuspicious: true });

    const closedOrReunited = totalReunited;
    const resolvedPotential = totalReunited + totalActive + totalClaimed;
    const recoveryRate =
      resolvedPotential > 0
        ? Math.round((closedOrReunited / resolvedPotential) * 100)
        : 0;

    const categoryStats = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          lost: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await Item.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      trendMap[key] = { month: key, lost: 0, found: 0 };
    }

    monthlyTrends.forEach((entry) => {
      const key = `${monthNames[entry._id.month - 1]} ${entry._id.year}`;
      if (trendMap[key]) {
        if (entry._id.type === 'lost') trendMap[key].lost = entry.count;
        if (entry._id.type === 'found') trendMap[key].found = entry.count;
      }
    });

    const recentActivity = await ActivityLog.find()
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalItems,
        totalLost,
        totalFound,
        totalActive,
        totalClaimed,
        totalReunited,
        recoveryRate,
        totalClaims,
        pendingClaims,
        approvedClaims,
        suspiciousItems,
      },
      categoryStats,
      monthlyTrends: Object.values(trendMap),
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be user or admin.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    await logActivity(
      'ROLE_CHANGED',
      req.user._id,
      { targetUserId: user._id, newRole: role },
      req.ip
    );

    res.status(200).json({
      success: true,
      user,
      message: `User role updated to ${role}.`,
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own admin account.',
      });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    await logActivity(
      user.isBanned ? 'USER_SUSPENDED' : 'USER_REINSTATED',
      req.user._id,
      { targetUserId: user._id },
      req.ip
    );

    res.status(200).json({
      success: true,
      user,
      message: `User account has been ${user.isBanned ? 'suspended' : 'reinstated'}.`,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminItems = async (req, res, next) => {
  try {
    const { isSuspicious, status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (isSuspicious !== undefined && isSuspicious !== 'All') {
      query.isSuspicious = isSuspicious === 'true';
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email avatar')
      .sort('-createdAt')
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

const moderateItem = async (req, res, next) => {
  try {
    const { isSuspicious, moderationNotes } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    if (isSuspicious !== undefined) {
      item.isSuspicious = Boolean(isSuspicious);
    }
    if (moderationNotes !== undefined) {
      item.moderationNotes = moderationNotes;
    }

    await item.save();

    await logActivity(
      'ITEM_MODERATED',
      req.user._id,
      { itemId: item._id, isSuspicious: item.isSuspicious, moderationNotes },
      req.ip
    );

    res.status(200).json({
      success: true,
      item,
      message: `Report ${item.isSuspicious ? 'marked as suspicious' : 'approved for display'}.`,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Claim.countDocuments(query);
    const claims = await Claim.find(query)
      .populate({
        path: 'item',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate('claimant', 'name email phone avatar reputationScore')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: claims.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments();
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
  getUsers,
  updateUserRole,
  toggleUserBan,
  getAdminItems,
  moderateItem,
  getAdminClaims,
  getActivityLogs,
};
