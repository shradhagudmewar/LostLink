const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');

router.get('/public', async (req, res, next) => {
  try {
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const totalReunited = await Item.countDocuments({ status: 'reunited' });
    const activeCases = await Item.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();

    const resolved = totalReunited;
    const potential = totalReunited + activeCases;
    const recoveryRate = potential > 0 ? Math.round((resolved / potential) * 100) : 88;

    res.status(200).json({
      success: true,
      stats: {
        totalReports: totalLost + totalFound,
        totalLost,
        totalFound,
        totalReunited,
        activeCases,
        totalUsers,
        recoveryRate,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
