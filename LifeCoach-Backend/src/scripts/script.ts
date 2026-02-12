import pool from "../db.config"; // Ensure this path is correct
import bcrypt from "bcrypt";

const createSuperUser = async () => {
  const email = "superadmin@lifecoach.com";
  const plainPassword = "SuperSecurePassword123!"; 
  const fullName = "Super Admin";
  const roleId = 1; 

  try {
    console.log("Creating Superuser...");

    // 1. Check if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      console.log(" User already exists! Promoting to Admin instead...");
      await pool.query("UPDATE users SET role_id = $1 WHERE email = $2", [roleId, email]);
      console.log("User promoted to Admin (role_id: 1)");
      process.exit(0);
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Insert into Users table
    // Adjust column names (e.g., 'full_name' vs 'name') to match your DB
    const query = `
      INSERT INTO users (full_name, email, password, role_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING user_id, email, role_id
    `;
    
    const values = [fullName, email, hashedPassword, roleId];
    const newUser = await pool.query(query, values);

    console.log(" Superuser created successfully:");
    console.table(newUser.rows[0]);

  } catch (err) {
    console.error(" Error creating superuser:", err);
  } finally {
    await pool.end();
  }
};

createSuperUser();