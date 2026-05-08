const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const auth = require('../middleware/auth');

// Get all upcoming contests for a user
router.get('/', auth, async (req, res) => {
  try {
    const contests = await Contest.find({ 
      userId: req.user.id,
      startTime: { $gte: new Date() }
    }).sort({ startTime: 1 });
    res.json(contests);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add new contest
router.post('/', auth, async (req, res) => {
  try {
    const { title, startTime, platform, url } = req.body;
    
    const newContest = new Contest({
      userId: req.user.id,
      title,
      startTime,
      platform,
      url
    });

    const contest = await newContest.save();
    res.json(contest);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete contest
router.delete('/:id', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ msg: 'Contest not found' });
    if (contest.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await Contest.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Contest removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
