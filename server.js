const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  }
}));

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Ensure data folders exist
const cartDir = path.join(__dirname, '../data/carts');
const orderDir = path.join(__dirname, '../data/orders');
fs.mkdirSync(cartDir, { recursive: true });
fs.mkdirSync(orderDir, { recursive: true });

// Admin login route
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  // Use environment variable for admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'av09'; // Default for development
  
  if (password === adminPassword) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout route
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Protected admin routes
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(orderDir);
    const orders = files
      .filter(file => file.endsWith('.json'))
      .map(file => JSON.parse(fs.readFileSync(path.join(orderDir, file))));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// Routes

// Save cart
app.post('/api/cart/:userId', (req, res) => {
  const file = path.join(cartDir, `cart-${req.params.userId}.json`);
  fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
  res.json({ message: 'Cart saved' });
});

// Load cart
app.get('/api/cart/:userId', (req, res) => {
  const file = path.join(cartDir, `cart-${req.params.userId}.json`);
  if (fs.existsSync(file)) {
    res.json(JSON.parse(fs.readFileSync(file)));
  } else {
    res.json({ items: [], subtotal: 0, tax: 0, total: 0 });
  }
});

// Place order
app.post('/api/orders', (req, res) => {
  const orderId = Date.now().toString();
  const file = path.join(orderDir, `order-${orderId}.json`);
  const order = { ...req.body, id: orderId, date: new Date() };
  fs.writeFileSync(file, JSON.stringify(order, null, 2));
  res.json({ message: 'Order placed', orderId });
});

// Get order (only for the order owner)
app.get('/api/orders/:orderId', (req, res) => {
  const file = path.join(orderDir, `order-${req.params.orderId}.json`);
  if (fs.existsSync(file)) {
    res.json(JSON.parse(fs.readFileSync(file)));
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Serve index.html for unknown routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
