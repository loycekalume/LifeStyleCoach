import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to database', err)
  } else {
    console.log('Database connected:', result.rows)
  }
})

export default pool