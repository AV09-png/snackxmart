const oracledb = require('oracledb');

async function testConnection() {
    let connection;
    
    try {
        // Connect to database
        connection = await oracledb.getConnection({
            user: 'VAGHASAR',
            password: '991755701',
            connectString: 'localhost:1521/TESTSTUDENT'
        });

        console.log('Successfully connected to Oracle Database');
        
        // Test query
        const result = await connection.execute('SELECT table_name FROM user_tables');
        console.log('Existing tables in your schema:', result.rows);

    } catch (err) {
        console.error('Error connecting to database:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Connection closed successfully');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

testConnection(); 