const Item = require('../models/Item');
const { calculateMatchScore } = require('../utils/smartMatch');

const getItemMatches = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { minScore = 35, limit = 10 } = req.query;

    const sourceItem = await Item.findById(itemId).populate('reportedBy', 'name email');
    if (!sourceItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const oppositeType = sourceItem.type === 'lost' ? 'found' : 'lost';

    const candidates = await Item.find({
      _id: { $ne: sourceItem._id },
      type: oppositeType,
      status: 'active',
      isSuspicious: false,
    }).populate('reportedBy', 'name email avatar');

    const matches = [];

    for (const candidate of candidates) {
      const { score, breakdown, reasons } = calculateMatchScore(sourceItem, candidate);
      if (score >= parseInt(minScore, 10)) {
        matches.push({
          item: candidate,
          score,
          breakdown,
          reasons,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      sourceItem,
      count: matches.length,
      matches: matches.slice(0, parseInt(limit, 10)),
    });
  } catch (error) {
    next(error);
  }
};

const getMyMatches = async (req, res, next) => {
  try {
    const myItems = await Item.find({
      reportedBy: req.user._id,
      status: 'active',
    });

    const results = [];

    for (const myItem of myItems) {
      const oppositeType = myItem.type === 'lost' ? 'found' : 'lost';

      const candidates = await Item.find({
        type: oppositeType,
        status: 'active',
        isSuspicious: false,
        reportedBy: { $ne: req.user._id },
      }).populate('reportedBy', 'name email avatar');

      const itemMatches = [];
      for (const candidate of candidates) {
        const { score, breakdown, reasons } = calculateMatchScore(myItem, candidate);
        if (score >= 40) {
          itemMatches.push({
            item: candidate,
            score,
            breakdown,
            reasons,
          });
        }
      }

      itemMatches.sort((a, b) => b.score - a.score);

      if (itemMatches.length > 0) {
        results.push({
          myItem,
          matchCount: itemMatches.length,
          matches: itemMatches,
        });
      }
    }

    res.status(200).json({
      success: true,
      totalMatchedReports: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
};

const compareItems = async (req, res, next) => {
  try {
    const { itemIdA, itemIdB } = req.body;

    if (!itemIdA || !itemIdB) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both itemIdA and itemIdB.',
      });
    }

    const itemA = await Item.findById(itemIdA).populate('reportedBy', 'name');
    const itemB = await Item.findById(itemIdB).populate('reportedBy', 'name');

    if (!itemA || !itemB) {
      return res.status(404).json({
        success: false,
        message: 'One or both items could not be found.',
      });
    }

    const matchResult = calculateMatchScore(itemA, itemB);

    res.status(200).json({
      success: true,
      itemA,
      itemB,
      ...matchResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemMatches,
  getMyMatches,
  compareItems,
};
