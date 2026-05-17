const authRoutes = require("./routes/authRoutes");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/trips', require('./routes/trips'));
app.use('/api/itinerary', require('./routes/itinerary'));
app.use('/api/expenses', require('./routes/expenses'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Wandr API running' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Make sure MongoDB is running: mongod');
    process.exit(1);
  });
