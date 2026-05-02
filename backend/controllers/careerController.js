const Career = require('../models/Career');

class CareerController {
  // Return all career postings, optionally filtered by active state or department.
  static async getAll(req, res) {
    try {
      const { is_active, department } = req.query;
      const filters = {};
      
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }
      if (department) {
        filters.department = department;
      }

      const careers = await Career.findAll(filters);
      res.json({ 
        count: careers.length,
        careers 
      });
    } catch (error) {
      console.error('Get careers error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve careers' 
      });
    }
  }

  // Return only active career postings for the public website.
  static async getActive(req, res) {
    try {
      const careers = await Career.findActive();
      res.json({ 
        count: careers.length,
        careers 
      });
    } catch (error) {
      console.error('Get active careers error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve careers' 
      });
    }
  }

  // Return a single career posting by its ID.
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const career = await Career.findById(id);

      if (!career) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Career posting not found' 
        });
      }

      res.json({ career });
    } catch (error) {
      console.error('Get career error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve career' 
      });
    }
  }

  // Create a new career posting and store the creating user's ID.
  static async create(req, res) {
    try {
      const careerData = req.body;
      const career = await Career.create(careerData, req.user.id);

      res.status(201).json({
        message: 'Career posting created successfully',
        career
      });
    } catch (error) {
      console.error('Create career error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to create career posting' 
      });
    }
  }

  // Update an existing career posting.
  static async update(req, res) {
    try {
      const { id } = req.params;
      const careerData = req.body;

      const career = await Career.update(id, careerData);

      if (!career) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Career posting not found' 
        });
      }

      res.json({
        message: 'Career posting updated successfully',
        career
      });
    } catch (error) {
      console.error('Update career error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to update career posting' 
      });
    }
  }

  // Delete a career posting by ID.
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const career = await Career.delete(id);

      if (!career) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Career posting not found' 
        });
      }

      res.json({ 
        message: 'Career posting deleted successfully',
        id: career.id 
      });
    } catch (error) {
      console.error('Delete career error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to delete career posting' 
      });
    }
  }

  // Save a public candidate application against a career posting.
  static async submitApplication(req, res) {
    try {
      const { id } = req.params;
      const {
        candidate_name,
        candidate_email,
        candidate_phone,
        years_of_experience,
        current_location,
        resume_link,
        cover_letter
      } = req.body;

      if (!candidate_name || !candidate_email) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Candidate name and email are required'
        });
      }

      const career = await Career.findById(id);
      if (!career || !career.is_active) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Career posting not found or inactive'
        });
      }

      const application = await Career.createApplication({
        career_id: id,
        candidate_name,
        candidate_email,
        candidate_phone,
        years_of_experience,
        current_location,
        resume_link,
        cover_letter
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application
      });
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to submit application'
      });
    }
  }

  // Return candidate applications for HR and super admin dashboards.
  static async getApplications(req, res) {
    try {
      const { status, career_id } = req.query;
      const filters = {};

      if (status) {
        filters.status = status;
      }

      if (career_id) {
        filters.career_id = career_id;
      }

      const applications = await Career.findApplications(filters);

      res.json({
        count: applications.length,
        applications
      });
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve applications'
      });
    }
  }

  // Update the status of a candidate application.
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Invalid status value'
        });
      }

      const updated = await Career.updateApplicationStatus(id, status);
      if (!updated) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Application not found'
        });
      }

      res.json({
        message: 'Application status updated successfully',
        application: updated
      });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update application status'
      });
    }
  }

  // Permanently delete a rejected candidate application.
  static async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Career.deleteApplication(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Application not found'
        });
      }

      res.json({
        message: 'Application rejected and removed successfully',
        id: deleted.id
      });
    } catch (error) {
      console.error('Delete application error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete application'
      });
    }
  }
}

module.exports = CareerController;
