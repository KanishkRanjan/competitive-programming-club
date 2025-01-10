const express = require('express');
const router = express.Router();


import leaderboardRoute from '../routes/leaderboard'
import scapperRoute from '../routes/scrapper'
import problemRoute from '../routes/problems'
import CustomError from '../utils/error/custom.error'


// Use specific routes
router.use('/leaderboard', leaderboardRoute);
router.use('/scrapper', scapperRoute);
router.use('/problems', problemRoute);

module.exports = router;
