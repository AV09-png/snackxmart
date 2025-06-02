require('dotenv').config();
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');

// Read the SQL file
const sqlFile = path.join(__dirname, 'init.sql');
const sqlCommands = fs.readFileSync(sqlFile, 'utf8')
    .split(';')
    .filter(cmd => cmd.trim())
    .map(cmd => cmd.trim() + ';');

async function initializeDatabase() {
    let connection;
    
    try {
        // Connect to database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        console.log('Connected to Oracle Database');

        // Execute each SQL command
        for (const sql of sqlCommands) {
            try {
                if (sql.includes('CREATE OR REPLACE TRIGGER')) {
                    // Handle PL/SQL blocks differently
                    await connection.execute(sql);
                } else {
                    await connection.execute(sql);
                }
                console.log('Successfully executed:', sql.substring(0, 50) + '...');
            } catch (err) {
                console.error('Error executing SQL:', sql.substring(0, 100));
                console.error('Error details:', err);
                // Continue with other commands even if one fails
            }
        }

        // Commit the transaction
        await connection.commit();
        console.log('Database initialization completed successfully');

    } catch (err) {
        console.error('Error during database initialization:', err);
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