import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Debug: Log to verify DATABASE_URL is loaded
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// Test connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to database', err);
  } else {
    console.log('✅ Database connected successfully at:', result.rows[0].now);
  }
});

export default pool;
