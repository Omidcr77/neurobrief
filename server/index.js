require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Require the cors package

const app = express();
app.use(express.json());

// Use CORS middleware
app.use(cors()); // This will allow all origins by default

// If you want to restrict to specific origins, you can do:
const corsOptions = {
  origin: ['*'], // Replace with your allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions)); // Use the CORS middleware with options

// Define your routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/summarize', require('./routes/summarize'));
app.use('/api/summaries', require('./routes/history')); 
app.use('/api/admin', require('./routes/admin')); // admin route

// demo route 
const demoRoutes = require('./routes/demo');
app.use('/api/demo', demoRoutes);

// Basic “Hello” route
app.get('/', (_, res) => res.send('🧠 NeuroBrief API is live!'));

const PORT = process.env.PORT || 5000; 
mongoose
  .connect(process.env.MONGO_URI) 
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 