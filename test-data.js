const oracledb = require('oracledb');

async function testDatabaseTables() {
    let connection;
    
    try {
        // Connect to database
        connection = await oracledb.getConnection({
            user: 'VAGHASAR',
            password: '991755701',
            connectString: 'localhost:1521/TESTSTUDENT'
        });

        console.log('Connected to Oracle Database');

        // Test Products table
        const products = await connection.execute(
            'SELECT * FROM products',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('\nProducts:', products.rows);

        // Test Categories table
        const categories = await connection.execute(
            'SELECT * FROM categories',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('\nCategories:', categories.rows);

        // Test Brands table
        const brands = await connection.execute(
            'SELECT * FROM brands',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log('\nBrands:', brands.rows);

        // Insert test data if tables are empty
        if (products.rows.length === 0) {
            await connection.execute(`
                INSERT INTO products (name, brand, price, weight, description, category) 
                VALUES ('Test Chips', 'Test Brand', 1.99, '100g', 'Test Description', 'Test Category')
            `);
            console.log('\nTest product inserted');
        }

        await connection.commit();
        console.log('\nDatabase test completed successfully');

    } catch (err) {
        console.error('Error during database test:', err);
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

// Run the test
testDatabaseTables(); 