const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const problems = await Problem.find({ userId: req.user.id });
    
    // Totals
    const totalSolved = problems.length;
    const leetCodeCount = problems.filter(p => p.platform === 'LeetCode').length;
    const gfgCount = problems.filter(p => p.platform === 'GFG').length;

    // Helper to get YYYY-MM-DD in local time
    const getLocalDateString = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Heatmap data
    const heatmapData = problems.reduce((acc, p) => {
      const date = getLocalDateString(p.solvedDate);
      const existing = acc.find(item => item.date === date);
      if (existing) existing.count += 1;
      else acc.push({ date, count: 1 });
      return acc;
    }, []);

    // Streak calculation
    let streak = 0;
    if (heatmapData.length > 0) {
      const solvedDatesSet = new Set(heatmapData.map(d => d.date));
      let dateToCheck = new Date();
      dateToCheck.setHours(0, 0, 0, 0);

      // If nothing solved today, check if streak is alive from yesterday
      if (!solvedDatesSet.has(getLocalDateString(dateToCheck))) {
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      }

      while (solvedDatesSet.has(getLocalDateString(dateToCheck))) {
        streak++;
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      }
    }

    res.json({
      streak, totalSolved, leetCodeCount, gfgCount, heatmapData
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
