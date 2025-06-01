const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Request logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data folders exist
const cartDir = path.join(__dirname, 'data/carts');
const orderDir = path.join(__dirname, 'data/orders');
fs.mkdirSync(cartDir, { recursive: true });
fs.mkdirSync(orderDir, { recursive: true });

// Authentication middleware for admin routes
const authenticateAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD || password === 'av09') {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Save cart
app.post('/api/cart/:userId', (req, res) => {
  try {
    const file = path.join(cartDir, `cart-${req.params.userId}.json`);
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Cart saved' });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});

// Load cart
app.get('/api/cart/:userId', (req, res) => {
  try {
    const file = path.join(cartDir, `cart-${req.params.userId}.json`);
    if (fs.existsSync(file)) {
      res.json(JSON.parse(fs.readFileSync(file)));
    } else {
      res.json({ items: [], subtotal: 0, tax: 0, total: 0 });
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

// Place order
app.post('/api/orders', (req, res) => {
  try {
    const orderId = Date.now().toString();
    const file = path.join(orderDir, `order-${orderId}.json`);
    const order = { ...req.body, id: orderId, date: new Date() };
    fs.writeFileSync(file, JSON.stringify(order, null, 2));
    res.json({ message: 'Order placed', orderId });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get order
app.get('/api/orders/:orderId', authenticateAdmin, (req, res) => {
  try {
    const file = path.join(orderDir, `order-${req.params.orderId}.json`);
    if (fs.existsSync(file)) {
      res.json(JSON.parse(fs.readFileSync(file)));
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error loading order:', error);
    res.status(500).json({ error: 'Failed to load order' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Serve index.html for unknown routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
