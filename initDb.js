require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

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
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Database initialized successfully');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initializeDatabase(); 