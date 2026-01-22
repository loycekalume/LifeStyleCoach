import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Log to verify DATABASE_URL is loaded
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

// Test connection
pool.connect((err, client) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error('Connection details:', {
      hasURL: !!process.env.DATABASE_URL,
      sslEnabled: process.env.DATABASE_URL?.includes('render.com')
    });
  } else {
    console.log('✅ Database connected successfully!');
    client.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.error('Query error:', err);
      } else {
        console.log('Database time:', result.rows[0].now);
      }
      client.release();
    });
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;