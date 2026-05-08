const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/revisions', require('./routes/revisions'));
app.use('/api/contests', require('./routes/contests'));

app.use('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-mastery', {
  family: 4
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
