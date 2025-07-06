// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Railway's DATABASE_URL
  // Add SSL configuration for production. Railway's PostgreSQL often requires SSL.
  // The `rejectUnauthorized: false` is a common workaround for untrusted certificates in many cloud environments.
  // For higher security in a strict production environment, you might need to fetch the specific CA certificate.
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;