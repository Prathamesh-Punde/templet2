const pool = require('../config/database');
const crypto = require('crypto');

class Support {
  // Generate unique ticket number
  // Build a human-readable unique support ticket reference.
  static generateTicketNumber() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `TKT-${datePart}-${randomPart}`;
  }

  // Create new support ticket
  // Insert a new support ticket with default pending status.
  static async create(ticketData) {
    const { customer_name, customer_email, customer_phone, subject, message, priority } = ticketData;
    for (let attempt = 0; attempt < 5; attempt++) {
      const ticket_number = this.generateTicketNumber();

      try {
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
      } catch (error) {
        if (error.code === '23505' && attempt < 4) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Unable to generate unique ticket number');
  }

  // Get all support tickets
  // Fetch support tickets with optional filters and assignee info.
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
  // Fetch one support ticket with assignment and resolution details.
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

  // Public tracking lookup by ticket number + mobile number.
  // Mobile must exist in customers table and match ticket customer phone.
  // Validate a support ticket against ticket number and mobile number.
  static async findByTrackingAndMobile(ticketNumber, mobileNo) {
    const result = await pool.query(
      `SELECT st.ticket_number, st.customer_name, st.subject, st.status, st.priority,
              st.created_at, st.updated_at, st.resolved_at
       FROM support_tickets st
       WHERE st.ticket_number = $1
         AND regexp_replace(COALESCE(st.customer_phone, ''), '\\D', '', 'g') = regexp_replace($2, '\\D', '', 'g')
         AND EXISTS (
           SELECT 1
           FROM customers c
           WHERE regexp_replace(COALESCE(c.mobile_no, ''), '\\D', '', 'g') = regexp_replace($2, '\\D', '', 'g')
         )
       LIMIT 1`,
      [ticketNumber, mobileNo]
    );

    return result.rows[0];
  }

  // Update ticket
  // Update a ticket's status, priority, or assignee.
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
  // Assign a ticket to a user and move it into progress.
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
  // Mark the ticket as resolved and record resolver details.
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
  // Store a public or internal response against a ticket.
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
  // Fetch all responses for a ticket in chronological order.
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
  // Permanently remove a support ticket.
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM support_tickets WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Get ticket statistics
  // Return dashboard counts for support ticket statuses and priority.
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

  // Get ticket by tracking number for public tracking workflow.
  // Fetch a support ticket by tracking ID only.
  static async findByTrackingNumber(ticketNumber) {
    const result = await pool.query(
      `SELECT st.ticket_number, st.customer_name, st.customer_phone, st.subject, st.status,
              st.priority, st.created_at, st.updated_at, st.resolved_at
       FROM support_tickets st
       WHERE st.ticket_number = $1
       LIMIT 1`,
      [ticketNumber]
    );

    return result.rows[0];
  }

  // Check whether mobile number exists in customers table.
  // Confirm whether the provided mobile number belongs to a customer record.
  static async isCustomerMobileRegistered(mobileNo) {
    const result = await pool.query(
      `SELECT 1
       FROM customers c
       WHERE regexp_replace(COALESCE(c.mobile_no, ''), '\\D', '', 'g') = regexp_replace($1, '\\D', '', 'g')
       LIMIT 1`,
      [mobileNo]
    );

    return result.rowCount > 0;
  }
}

module.exports = Support;
