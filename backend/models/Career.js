const pool = require('../config/database');

class Career {
  // Create new career posting
  // Insert a new career posting and link it to the creating admin.
  static async create(careerData, userId) {
    const { 
      job_title, department, location, employment_type, 
      description, requirements, responsibilities, salary_range 
    } = careerData;

    const result = await pool.query(
      `INSERT INTO careers (
        job_title, department, location, employment_type, 
        description, requirements, responsibilities, salary_range, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [job_title, department, location, employment_type, 
       description, requirements, responsibilities, salary_range, userId]
    );

    return result.rows[0];
  }

  // Get all career postings
  // Fetch career postings with optional filters and creator name.
  static async findAll(filters = {}) {
    let query = `
      SELECT c.*, u.username as created_by_name 
      FROM careers c
      LEFT JOIN users u ON c.created_by = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.is_active !== undefined) {
      paramCount++;
      conditions.push(`c.is_active = $${paramCount}`);
      values.push(filters.is_active);
    }

    if (filters.department) {
      paramCount++;
      conditions.push(`c.department = $${paramCount}`);
      values.push(filters.department);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get career by ID
  // Fetch one career posting with creator information.
  static async findById(id) {
    const result = await pool.query(
      `SELECT c.*, u.username as created_by_name 
       FROM careers c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Update career posting
  // Update editable fields for a career posting.
  static async update(id, careerData) {
    const { 
      job_title, department, location, employment_type, 
      description, requirements, responsibilities, salary_range, is_active 
    } = careerData;

    const result = await pool.query(
      `UPDATE careers 
       SET job_title = COALESCE($1, job_title),
           department = COALESCE($2, department),
           location = COALESCE($3, location),
           employment_type = COALESCE($4, employment_type),
           description = COALESCE($5, description),
           requirements = COALESCE($6, requirements),
           responsibilities = COALESCE($7, responsibilities),
           salary_range = COALESCE($8, salary_range),
           is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [job_title, department, location, employment_type, 
       description, requirements, responsibilities, salary_range, is_active, id]
    );
    return result.rows[0];
  }

  // Delete career posting
  // Remove a career posting permanently.
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM careers WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Get active career postings for public view
  // Return only active careers for the public website.
  static async findActive() {
    const result = await pool.query(
      `SELECT id, job_title, department, location, employment_type, 
              description, requirements, responsibilities, salary_range, created_at
       FROM careers 
       WHERE is_active = true 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // Create new career application from public careers page
  // Save a candidate application for a selected career.
  static async createApplication(applicationData) {
    const {
      career_id,
      candidate_name,
      candidate_email,
      candidate_phone,
      years_of_experience,
      current_location,
      resume_link,
      cover_letter
    } = applicationData;

    const result = await pool.query(
      `INSERT INTO career_applications (
        career_id, candidate_name, candidate_email, candidate_phone,
        years_of_experience, current_location, resume_link, cover_letter
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        career_id,
        candidate_name,
        candidate_email,
        candidate_phone || null,
        years_of_experience || null,
        current_location || null,
        resume_link || null,
        cover_letter || null
      ]
    );

    return result.rows[0];
  }

  // Get all applications for admin panel
  // Fetch applications with career details for HR/admin review.
  static async findApplications(filters = {}) {
    let query = `
      SELECT 
        ca.*,
        c.job_title,
        c.department,
        c.location as job_location
      FROM career_applications ca
      INNER JOIN careers c ON c.id = ca.career_id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      conditions.push(`ca.status = $${paramCount}`);
      values.push(filters.status);
    }

    if (filters.career_id) {
      paramCount++;
      conditions.push(`ca.career_id = $${paramCount}`);
      values.push(filters.career_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ca.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update application status from admin panel
  // Change the review status of a career application.
  static async updateApplicationStatus(id, status) {
    const result = await pool.query(
      `UPDATE career_applications
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  // Delete application from admin panel
  // Remove a rejected career application.
  static async deleteApplication(id) {
    const result = await pool.query(
      'DELETE FROM career_applications WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  }
}

module.exports = Career;
