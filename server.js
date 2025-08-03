const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://cebolakhekhambule3:mY5UPqyhDLEXI1wb@mt5-trading.bn4afv4.mongodb.net/mt5-trading?retryWrites=true&w=majority&appName=MT5-Trading';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Schema
const DataSchema = new mongoose.Schema({
  clientId: String,
  type: String,
  accountInfo: Object,
  indicators: Array,
  timestamp: { type: Date, default: Date.now }
});

const MT5Data = mongoose.model('MT5Data', DataSchema);

// Receive data
app.post('/api/mt5-data', async (req, res) => {
  try {
    console.log('📊 Received:', req.body.type, 'from', req.body.clientId);
    
    await MT5Data.findOneAndUpdate(
      { clientId: req.body.clientId },
      req.body,
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get data
app.get('/api/mt5-data/:clientId', async (req, res) => {
  try {
    const data = await MT5Data.findOne({ clientId: req.params.clientId });
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'MT5 Server Running', mongodb: mongoose.connection.readyState === 1 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
