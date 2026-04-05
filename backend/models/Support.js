const pool = require('../config/database');

class Support {
  // Generate unique ticket number
  static generateTicketNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  }

  // Create new support ticket
  static async create(ticketData) {
    const { customer_name, customer_email, customer_phone, subject, message, priority } = ticketData;
    const ticket_number = this.generateTicketNumber();

    const result = await pool.query(
      `INSERT INTO support_tickets (
        ticket_number, customer_name, customer_email, customer_phone, 
        subject, message, priority, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [ticket_number, customer_name, customer_email, customer_phone, 
       subject, message, priority || 'medium', 'pending']
    );

    return result.rows[0];
  }

  // Get all support tickets
  static async findAll(filters = {}) {
    let query = `
      SELECT st.*, 
             u1.username as assigned_to_name,
             u2.username as resolved_by_name
      FROM support_tickets st
      LEFT JOIN users u1 ON st.assigned_to = u1.id
      LEFT JOIN users u2 ON st.resolved_by = u2.id
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      conditions.push(`st.status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.assigned_to) {
      paramCount++;
      conditions.push(`st.assigned_to = $${paramCount}`);
      values.push(filters.assigned_to);
    }

    if (filters.priority) {
      paramCount++;
      conditions.push(`st.priority = $${paramCount}`);
      values.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY st.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get ticket by ID
  static async findById(id) {
    const result = await pool.query(
      `SELECT st.*, 
              u1.username as assigned_to_name,
              u2.username as resolved_by_name
       FROM support_tickets st
       LEFT JOIN users u1 ON st.assigned_to = u1.id
       LEFT JOIN users u2 ON st.resolved_by = u2.id
       WHERE st.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Update ticket
  static async update(id, ticketData) {
    const { status, priority, assigned_to } = ticketData;

    const result = await pool.query(
      `UPDATE support_tickets 
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to = COALESCE($3, assigned_to),
           resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = $4
       RETURNING *`,
      [status, priority, assigned_to, id]
    );
    return result.rows[0];
  }

  // Assign ticket to user
  static async assign(ticketId, userId) {
    const result = await pool.query(
      `UPDATE support_tickets 
       SET assigned_to = $1, status = 'in_progress'
       WHERE id = $2
       RETURNING *`,
      [userId, ticketId]
    );
    return result.rows[0];
  }

  // Resolve ticket
  static async resolve(ticketId, userId) {
    const result = await pool.query(
      `UPDATE support_tickets 
       SET status = 'resolved', 
           resolved_by = $1,
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [userId, ticketId]
    );
    return result.rows[0];
  }

  // Add response to ticket
  static async addResponse(ticketId, userId, responseText, isInternal = false) {
    const result = await pool.query(
      `INSERT INTO ticket_responses (ticket_id, user_id, response, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ticketId, userId, responseText, isInternal]
    );
    return result.rows[0];
  }

  // Get ticket responses
  static async getResponses(ticketId) {
    const result = await pool.query(
      `SELECT tr.*, u.username as user_name
       FROM ticket_responses tr
       LEFT JOIN users u ON tr.user_id = u.id
       WHERE tr.ticket_id = $1
       ORDER BY tr.created_at ASC`,
      [ticketId]
    );
    return result.rows;
  }

  // Delete ticket
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM support_tickets WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Get ticket statistics
  static async getStatistics() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
      FROM support_tickets
    `);
    return result.rows[0];
  }
}

module.exports = Support;
