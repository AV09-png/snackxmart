const oracledb = require('oracledb');

async function initializeDatabase() {
    let connection;
    
    try {
        // Connect to database
        connection = await oracledb.getConnection({
            user: 'VAGHASAR',
            password: '991755701',
            connectString: 'localhost:1521/TESTSTUDENT'
        });

        console.log('Connected to Oracle Database');

        // Drop existing tables if they exist
        try {
            await connection.execute('DROP TABLE order_items');
            await connection.execute('DROP TABLE orders');
            await connection.execute('DROP TABLE products');
            await connection.execute('DROP TABLE categories');
            await connection.execute('DROP TABLE brands');
            console.log('Existing tables dropped');
        } catch (err) {
            console.log('No existing tables to drop');
        }

        // Create Products Table
        await connection.execute(`
            CREATE TABLE products (
                product_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR2(100) NOT NULL,
                brand VARCHAR2(50) NOT NULL,
                price NUMBER(10,2) NOT NULL,
                weight VARCHAR2(20) NOT NULL,
                description VARCHAR2(1000),
                category VARCHAR2(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Products table created');

        // Create Categories Table
        await connection.execute(`
            CREATE TABLE categories (
                category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR2(50) NOT NULL UNIQUE,
                description VARCHAR2(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Categories table created');

        // Create Brands Table
        await connection.execute(`
            CREATE TABLE brands (
                brand_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR2(50) NOT NULL UNIQUE,
                description VARCHAR2(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Brands table created');

        // Insert sample data
        await connection.execute(`
            INSERT INTO categories (name, description) VALUES 
            ('Chips', 'Various types of potato and corn chips')
        `);

        await connection.execute(`
            INSERT INTO brands (name, description) VALUES 
            ('Balaji', 'Premium Indian snacks manufacturer')
        `);

        await connection.execute(`
            INSERT INTO products (name, brand, price, weight, description, category) 
            VALUES ('Cream & Onion Chips', 'Balaji', 2.49, '135g', 'Crispy potato chips with cream and onion flavor', 'Chips')
        `);
        console.log('Sample data inserted');

        // Commit the transaction
        await connection.commit();
        console.log('Database initialization completed successfully');

    } catch (err) {
        console.error('Error during database initialization:', err);
        if (connection) {
            try {
                await connection.rollback();
                console.log('Transaction rolled back');
            } catch (rollbackErr) {
                console.error('Error rolling back:', rollbackErr);
            }
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

// Run the initialization
initializeDatabase(); 