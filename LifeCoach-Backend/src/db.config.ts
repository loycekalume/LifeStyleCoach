import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Use Render DB URL if in production, otherwise use local DB config
const pool = process.env.NODE_ENV === 'production' || process.env.USE_RENDER === 'true'
  ? new Pool({
      connectionString: process.env.RENDER_DB_URL,
      ssl: {
        rejectUnauthorized: false 
      }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to database', err)
  } else {
    console.log('Database connected:', result.rows)
    console.log('Using:', process.env.NODE_ENV === 'production' || process.env.USE_RENDER === 'true' ? 'Render DB' : 'Local DB')
  }
})

export default pool