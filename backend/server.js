const express     = require('express');
const cors        = require('cors');
const bodyParser  = require('body-parser');
require('dotenv').config();





const authRouter     = require('./routes/auth');
console.log('✅ auth router loaded');
const visitorsRouter = require('./routes/visitors');
console.log('✅ visitors router loaded');
const hostsRouter    = require('./routes/hosts');
console.log('✅ hosts router loaded');
const approvalRouter = require('./routes/approval');
console.log('✅ approval router loaded');
const adminRouter = require('./routes/admin');
console.log('✅ admin router loaded');


const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));    // large limit for base64 photos
app.use(bodyParser.urlencoded({ extended: true })); // for approval form

// Routes
app.use('/api/auth',     authRouter);
app.use('/api/visitors', visitorsRouter);
app.use('/api/hosts',    hostsRouter);
app.use('/api/approval', approvalRouter);
app.use('/api/admin', adminRouter);
console.log('✅ All routes registered successfully');

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});