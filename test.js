const oracledb = require('oracledb');

async function testConnection() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: 'VAGHASAR',
            password: '991755701',
            connectString: 'localhost:1521/TESTSTUDENT'
        });
        console.log('Successfully connected to Oracle Database');

        // Test query to check table structure
        const tableInfo = await connection.execute(`
            SELECT table_name, column_name, data_type, data_length
            FROM user_tab_columns
            WHERE table_name IN ('PRODUCTS', 'CATEGORIES', 'BRANDS', 'ORDERS', 'ORDER_ITEMS')
            ORDER BY table_name, column_id
        `);
        
        console.log('\nTable Structure:');
        tableInfo.rows.forEach(row => {
            console.log(`${row[0]}.${row[1]} (${row[2]}${row[3] ? '(' + row[3] + ')' : ''})`);
        });

        // Count records in each table
        const tables = ['PRODUCTS', 'CATEGORIES', 'BRANDS', 'ORDERS', 'ORDER_ITEMS'];
        console.log('\nRecord Counts:');
        for (const table of tables) {
            const result = await connection.execute(`SELECT COUNT(*) FROM ${table}`);
            console.log(`${table}: ${result.rows[0][0]} records`);
        }

    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('\nDatabase connection closed');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

testConnection(); 