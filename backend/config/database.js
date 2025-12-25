const mysql = require('mysql2/promise');
require('dotenv').config();

// Check if we are connecting to TiDB Cloud
// (TiDB hosts always contain 'tidbcloud')
const isTiDB = process.env.DB_HOST?.includes('tidbcloud');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'VinHousing',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // ✅ SMART SWITCH:
  // Only enable SSL if we detect we are using TiDB Cloud.
  // Localhost will now run without SSL (which is standard).
  ssl: isTiDB ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  } : undefined
});

// Simple connection test
pool.getConnection()
  .then(conn => {
    console.log(`✅ Connected to Database: ${isTiDB ? 'TiDB Cloud (Production)' : 'Local MySQL (Development)'}`);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = pool;