const pool = require('../config/database');

class Enquiry {
  // Insert a new enquiry coming from the public contact form.
  static async create(enquiryData) {
    const {
      name,
      email,
      phone,
      subject,
      service,
      message
    } = enquiryData;

    const result = await pool.query(
      `INSERT INTO enquiries (
        full_name, email, phone, subject, service, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        name,
        email,
        phone || null,
        subject,
        service || null,
        message,
        'new'
      ]
    );

    return result.rows[0];
  }

  // Fetch enquiries with optional filters and handler name.
  static async findAll(filters = {}) {
    let query = `
      SELECT e.*, u.username as handled_by_name
      FROM enquiries e
      LEFT JOIN users u ON e.handled_by = u.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      conditions.push(`e.status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.handled_by) {
      paramCount++;
      conditions.push(`e.handled_by = $${paramCount}`);
      values.push(filters.handled_by);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Fetch one enquiry record by ID.
  static async findById(id) {
    const result = await pool.query(
      `SELECT e.*, u.username as handled_by_name
       FROM enquiries e
       LEFT JOIN users u ON e.handled_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  // Update enquiry follow-up fields and ownership.
  static async update(id, enquiryData, userId) {
    const {
      call_time,
      comments,
      status,
      next_followup_date
    } = enquiryData;

    const result = await pool.query(
      `UPDATE enquiries
       SET call_time = COALESCE($1, call_time),
           comments = COALESCE($2, comments),
           status = COALESCE($3, status),
           next_followup_date = COALESCE($4, next_followup_date),
           handled_by = COALESCE($5, handled_by)
       WHERE id = $6
       RETURNING *`,
      [call_time, comments, status, next_followup_date || null, userId, id]
    );

    return result.rows[0];
  }

  // Remove an enquiry permanently.
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM enquiries WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  }

  // Return enquiry dashboard summary counts.
  static async getStatistics() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_enquiries,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
        COUNT(CASE WHEN status = 'asked_for_next_followup' THEN 1 END) as follow_up
      FROM enquiries
    `);

    return result.rows[0];
  }
}

module.exports = Enquiry;
