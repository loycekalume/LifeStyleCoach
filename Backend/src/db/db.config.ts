import { Pool } from "pg";
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})


pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error(" Database connection failed:", err);
  } else {
    console.log(" Database connected at:", res.rows[0].now);
  }
});

export default pool;
