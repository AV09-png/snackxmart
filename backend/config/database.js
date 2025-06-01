const oracledb = require('oracledb');

// Database configuration
const dbConfig = {
    user: 'VAGHASAR',
    password: '991755701',
    connectString: 'localhost:1521/TESTSTUDENT',
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1
};

// Initialize database pool
async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool created successfully');
    } catch (err) {
        console.error('Error creating connection pool:', err);
        throw err;
    }
}

// Get connection from pool
async function getConnection() {
    try {
        const connection = await oracledb.getConnection();
        return connection;
    } catch (err) {
        console.error('Error getting connection from pool:', err);
        throw err;
    }
}

// Close connection
async function closeConnection(connection) {
    try {
        await connection.close();
    } catch (err) {
        console.error('Error closing connection:', err);
        throw err;
    }
}

// Close pool
async function closePool() {
    try {
        await oracledb.getPool().close(10);
        console.log('Pool closed successfully');
    } catch (err) {
        console.error('Error closing pool:', err);
        throw err;
    }
}

module.exports = {
    initialize,
    getConnection,
    closeConnection,
    closePool
}; 