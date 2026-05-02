const pool = require('../config/database');

class Customer {
  // Insert a new customer record and link it to the creator.
  static async create(customerData, userId) {
    const {
      customer_name,
      product,
      mobile_no,
      purchase_date,
      notes
    } = customerData;

    const result = await pool.query(
      `INSERT INTO customers (
        customer_name, product, mobile_no, purchase_date, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        customer_name,
        product,
        mobile_no,
        purchase_date,
        notes || null,
        userId
      ]
    );

    return result.rows[0];
  }

  // Fetch customers with optional filtering by product or name.
  static async findAll(filters = {}) {
    let query = `
      SELECT c.*, u.username AS created_by_name
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.product) {
      paramCount++;
      conditions.push(`c.product ILIKE $${paramCount}`);
      values.push(`%${filters.product}%`);
    }

    if (filters.customer_name) {
      paramCount++;
      conditions.push(`c.customer_name ILIKE $${paramCount}`);
      values.push(`%${filters.customer_name}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Fetch one customer record with creator information.
  static async findById(id) {
    const result = await pool.query(
      `SELECT c.*, u.username AS created_by_name
       FROM customers c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  // Update customer details except the auto-generated customer ID.
  static async update(id, customerData) {
    const {
      customer_name,
      product,
      mobile_no,
      purchase_date,
      notes
    } = customerData;

    const result = await pool.query(
      `UPDATE customers
       SET customer_name = COALESCE($1, customer_name),
           product = COALESCE($2, product),
           mobile_no = COALESCE($3, mobile_no),
           purchase_date = COALESCE($4, purchase_date),
           notes = COALESCE($5, notes)
       WHERE id = $6
       RETURNING *`,
      [
        customer_name,
        product,
        mobile_no,
        purchase_date,
        notes,
        id
      ]
    );

    return result.rows[0];
  }

  // Delete a customer record permanently.
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  }
}

module.exports = Customer;
