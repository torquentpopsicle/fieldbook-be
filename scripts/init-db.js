require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../services/db');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Read and execute the migration file
    const migrationPath = path.join(
      __dirname,
      '../migrations/001_create_users_table.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Database initialized successfully!');
    console.log('✅ Users table created with initial data');

    // Test the connection by querying users
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`✅ Found ${result.rows[0].user_count} users in the database`);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();
