require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('.'));
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

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Neon database connection
    }
});

// Test database connection
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW()');
            console.log('Database connection test successful:', result.rows[0].now);
            return true;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Database connection test failed:', err.message);
        return false;
    }
}

// Create customers table if it doesn't exist
async function initializeDatabase() {
    try {
        const client = await pool.connect();
        try {
            // Create customers table
            await client.query(`
                CREATE TABLE IF NOT EXISTS customers (
                    id SERIAL PRIMARY KEY,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    city VARCHAR(100) NOT NULL,
                    province VARCHAR(50) NOT NULL,
                    postal_code VARCHAR(10) NOT NULL,
                    shipping_method VARCHAR(50) NOT NULL,
                    delivery_instructions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create orders table
            await client.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    order_number VARCHAR(50) UNIQUE NOT NULL,
                    customer_id INTEGER REFERENCES customers(id),
                    items JSONB NOT NULL,
                    subtotal DECIMAL(10,2) NOT NULL,
                    tax DECIMAL(10,2) NOT NULL,
                    total DECIMAL(10,2) NOT NULL,
                    shipping_method VARCHAR(50) NOT NULL,
                    payment_method VARCHAR(50) NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Database initialized successfully');
            return true;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err.message);
        return false;
    }
}

// Initialize server
async function startServer() {
    try {
        // Test database connection first
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            console.error('Failed to connect to database. Please check your connection string and try again.');
            process.exit(1);
        }

        // Initialize database
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.error('Failed to initialize database. Please check the error logs.');
            process.exit(1);
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
                app.listen(PORT + 1, () => {
                    console.log(`Server running at http://localhost:${PORT + 1}`);
                });
            } else {
                console.error('Server error:', err.message);
            }
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

// API endpoint to save customer information
app.post('/api/save-customer', async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            province,
            postalCode,
            shippingMethod,
            deliveryInstructions
        } = req.body;

        const result = await client.query(
            `INSERT INTO customers (
                first_name,
                last_name,
                email,
                phone,
                address,
                city,
                province,
                postal_code,
                shipping_method,
                delivery_instructions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [firstName, lastName, email, phone, address, city, province, postalCode, shippingMethod, deliveryInstructions]
        );

        res.json({
            success: true,
            customerId: result.rows[0].id,
            message: 'Customer information saved successfully'
        });
    } catch (err) {
        console.error('Error saving customer:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error saving customer information',
            details: err.message
        });
    } finally {
        client.release();
    }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW()');
            res.json({
                success: true,
                message: 'API is working',
                serverTime: result.rows[0].now
            });
        } finally {
            client.release();
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'API test failed',
            error: err.message
        });
    }
});

// API endpoint to place order
app.post('/api/place-order', async (req, res) => {
    const client = await pool.connect();
    try {
        const orderData = req.body;
        
        // Generate unique order number
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        orderData.orderNumber = orderNumber;

        // Insert order into database
        const result = await client.query(
            `INSERT INTO orders (
                order_number,
                customer_id,
                items,
                subtotal,
                tax,
                total,
                shipping_method,
                payment_method,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [
                orderNumber,
                orderData.customerId,
                JSON.stringify(orderData.items),
                orderData.subtotal,
                orderData.tax,
                orderData.total,
                orderData.shippingMethod,
                orderData.paymentMethod,
                'pending'
            ]
        );

        res.status(201).json({
            success: true,
            orderNumber: orderNumber,
            message: 'Order placed successfully'
        });
    } catch (err) {
        console.error('Error placing order:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error placing order',
            details: err.message
        });
    } finally {
        client.release();
    }
});

// Start the server
startServer();
