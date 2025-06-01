const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database connection pool
db.initialize().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// API Routes will be added here

app.post('/api/feedback', (req, res) => {
  console.log(req.body);
  res.send({ status: 'Received' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await db.closePool();
        console.log('Database pool closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
