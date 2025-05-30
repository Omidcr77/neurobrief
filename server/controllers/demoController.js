const Summary = require('../models/Summary');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getDemoToken = async (req, res) => {
  try {
    let demoUser = await User.findOne({ email: 'demo@neurobrief.app' });
    
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demopassword', salt);
      
      demoUser = new User({
        name: 'Demo User',
        email: 'demo@neurobrief.app',
        passwordHash: hashedPassword,
        role: 'user',
        isDemo: true
      });
      await demoUser.save();
    }

    const demoSummaries = [
      {
        inputType: 'text',
        input: 'The Renaissance was a period in European history marking the transition from the Middle Ages to modernity...',
        summary: 'The Renaissance was a transformative period bridging medieval and modern Europe, characterized by renewed interest in classical philosophy and artistic innovation.',
        user: demoUser._id
      },
      {
        inputType: 'url',
        input: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
        inputFileName: 'Artificial Intelligence - Wikipedia',
        summary: 'Artificial intelligence involves machines mimicking human cognitive functions. Key areas include machine learning, neural networks, and natural language processing.',
        user: demoUser._id
      },
      {
        inputType: 'pdf',
        input: 'PDF placeholder content', // ADD THIS REQUIRED FIELD
        inputFileName: 'Climate_Change_Report.pdf',
        summary: 'Current climate models predict a 2-5°C temperature rise by 2100. Urgent action is needed to reduce carbon emissions through policy changes and green technology adoption.',
        user: demoUser._id
      }
    ];

    await Summary.deleteMany({ user: demoUser._id });
    await Summary.insertMany(demoSummaries);

    const token = jwt.sign(
      { userId: demoUser._id, isDemo: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Demo setup error:', error);
    res.status(500).json({ 
      message: 'Failed to setup demo account',
      error: error.message
    });
  }
};