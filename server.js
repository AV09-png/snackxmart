const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ensure data folders exist
const cartDir = path.join(__dirname, '../data/carts');
const orderDir = path.join(__dirname, '../data/orders');
fs.mkdirSync(cartDir, { recursive: true });
fs.mkdirSync(orderDir, { recursive: true });

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

// Get order
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
