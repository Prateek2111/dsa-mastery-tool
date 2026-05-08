const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const REVISION_DAYS = [1, 3, 7, 15, 30, 60, 120];

// Fetch metadata from URL using Gemini
router.post('/fetch-metadata', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ msg: 'URL is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ msg: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `Analyze this DSA problem URL: ${url}. 
    Extract and return only a JSON object with these keys: 
    "title" (the problem title), 
    "platform" (either "LeetCode", "GFG", or "Other"), 
    "difficulty" (either "Easy", "Medium", or "Hard"),
    "timeComplexity" (just the string after O, e.g., "N log N" for O(N log N)), 
    "spaceComplexity" (just the string after O, e.g., "1" for O(1)). 
    If you cannot find specific info, provide your best guess based on the problem title in the URL.
    Response must be valid JSON only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Clean JSON string from potential markdown backticks
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const metadata = JSON.parse(cleanJson);
      res.json(metadata);
    } catch (parseErr) {
      console.error('JSON Parse Error:', text);
      res.status(500).json({ msg: 'Failed to parse Gemini response', raw: text });
    }
  } catch (err) {
    console.error('Gemini Error Details:', err);
    res.status(500).json({ msg: err.message || 'Failed to fetch metadata' });
  }
});

// Get all problems for a user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    
    // Support filtering and searching in query
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.platform) query.platform = req.query.platform;
    if (req.query.difficulty) query.difficulty = req.query.difficulty;

    const total = await Problem.countDocuments(query);
    
    let problemsQuery = Problem.find(query).sort({ solvedDate: -1 });
    
    if (limit > 0) {
      problemsQuery = problemsQuery.skip(skip).limit(limit);
    }

    const problems = await problemsQuery;

    if (limit > 0) {
      res.json({
        problems,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProblems: total
      });
    } else {
      res.json(problems);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add new problem
router.post('/', auth, async (req, res) => {
  try {
    const { title, platform, url, difficulty, topics, approachNotes, timeComplexity, spaceComplexity, confidenceLevel, solvedDate } = req.body;
    
    const baseDate = solvedDate ? new Date(solvedDate) : new Date();
    
    // Generate revision schedule
    const revisionSchedule = REVISION_DAYS.map(day => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + day);
      return { day, date, status: 'pending', confidence: null };
    });

    const newProblem = new Problem({
      userId: req.user.id,
      title, platform, url, difficulty, topics, approachNotes, timeComplexity, spaceComplexity,
      confidenceLevel, solvedDate: baseDate, revisionSchedule
    });

    const problem = await newProblem.save();
    res.json(problem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// Mark revision
router.put('/:id/revision/:day', auth, async (req, res) => {
  try {
    const { status, confidence } = req.body;
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });
    if (problem.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const revisionIndex = problem.revisionSchedule.findIndex(r => r.day === parseInt(req.params.day));
    if (revisionIndex === -1) return res.status(404).json({ msg: 'Revision schedule not found' });

    problem.revisionSchedule[revisionIndex].status = status;
    
    if (status === 'done') {
      problem.revisionSchedule[revisionIndex].confidence = confidence;
      problem.consecutiveSkips = 0;
      
      // Update global confidence if this was a high confidence session
      if (confidence === 'High') {
        problem.confidenceLevel = 'High';
      }
      
      // Check if mastered
      const allDone = problem.revisionSchedule.every(r => r.status === 'done');
      if (allDone || confidence === 'High') {
        problem.isMastered = true;
      }
    } else if (status === 'skipped') {
      problem.consecutiveSkips += 1;
      
      // If skipped repeatedly (e.g., 2+ times in a row)
      if (problem.consecutiveSkips >= 2) {
        // Confidence Decay Logic
        const confMap = { 'High': 'Medium', 'Medium': 'Low', 'Low': 'Low' };
        problem.confidenceLevel = confMap[problem.confidenceLevel] || 'Low';
        
        // Reset consecutive skips after decay to allow for another cycle
        problem.consecutiveSkips = 0;
      }
      
      // If skipped, we might want to reset isMastered if it was true
      problem.isMastered = false;
    }

    await problem.save();
    res.json(problem);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});



// Get hint using Gemini
router.get('/:id/hint/:type', auth, async (req, res) => {
  try {
    const { id, type } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });
    if (problem.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ msg: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const hintTypes = {
      '1': 'Brute Force approach',
      '2': 'Better approach (improving time or space complexity)',
      '3': 'Optimal approach'
    };

    const hintTypeLabel = hintTypes[type] || 'Optimal approach';

    const prompt = `Provide a concise hint for the DSA problem: "${problem.title}" (URL: ${problem.url}). 
    The hint should be for the ${hintTypeLabel}. 
    Focus on the logic and intuition, not the full code. 
    Keep it short and helpful for a student. 
    Use markdown if needed but keep it very brief.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ hint: text });
  } catch (err) {
    console.error('Gemini Hint Error:', err);
    res.status(500).json({ msg: 'Failed to generate hint' });
  }
});

module.exports = router;

