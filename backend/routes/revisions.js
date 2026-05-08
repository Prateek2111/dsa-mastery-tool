const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const problems = await Problem.find({
      userId: req.user.id,
      isMastered: false,
      revisionSchedule: {
        $elemMatch: {
          date: { $gte: today, $lt: tomorrow },
          status: 'pending'
        }
      }
    });
    
    // Also fetch overdue (past today and pending)
    const overdueProblems = await Problem.find({
      userId: req.user.id,
      isMastered: false,
      revisionSchedule: {
        $elemMatch: {
          date: { $lt: today },
          status: 'pending'
        }
      }
    });

    res.json({ dueToday: problems, overdue: overdueProblems });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/upcoming', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 8); // up to 7 days from tomorrow

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const problems = await Problem.find({
      userId: req.user.id,
      isMastered: false,
      revisionSchedule: {
        $elemMatch: {
          date: { $gte: tomorrow, $lt: in7Days },
          status: 'pending'
        }
      }
    });
    
    res.json(problems);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
