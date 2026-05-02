const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Create new user
  // Insert a new admin user with a hashed password.
  static async create(userData) {
    const { username, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, role, is_active, created_at`,
      [username, email, hashedPassword, role]
    );

    return result.rows[0];
  }

  // Find user by email
  // Look up a user account by email address.
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Find user by ID
  // Look up a user account by primary key.
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all users
  // Return all admin users for the super admin panel.
  static async findAll() {
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Update user
  // Update editable user fields such as username, email, role, and status.
  static async update(id, userData) {
    const { username, email, role, is_active } = userData;
    const result = await pool.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING id, username, email, role, is_active, updated_at`,
      [username, email, role, is_active, id]
    );
    return result.rows[0];
  }

  // Update password
  // Replace a user's password with a newly hashed value.
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );
  }

  // Delete user
  // Delete a user record from the database.
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Verify password
  // Compare a plain password against its bcrypt hash.
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
