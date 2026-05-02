const Enquiry = require('../models/Enquiry');

class EnquiryController {
  // Create a new enquiry from the public contact form.
  static async create(req, res) {
    try {
      const { name, email, phone, subject, service, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Name, email, subject and message are required'
        });
      }

      const enquiry = await Enquiry.create({
        name,
        email,
        phone,
        subject,
        service,
        message
      });

      res.status(201).json({
        message: 'Enquiry submitted successfully',
        enquiry
      });
    } catch (error) {
      console.error('Create enquiry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to submit enquiry'
      });
    }
  }

  // Return all enquiries, optionally filtered by status or handler.
  static async getAll(req, res) {
    try {
      const { status, handled_by } = req.query;
      const filters = {};

      if (status) {
        filters.status = status;
      }

      if (handled_by) {
        filters.handled_by = parseInt(handled_by, 10);
      }

      const enquiries = await Enquiry.findAll(filters);
      res.json({
        count: enquiries.length,
        enquiries
      });
    } catch (error) {
      console.error('Get enquiries error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve enquiries'
      });
    }
  }

  // Return a single enquiry by ID.
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const enquiry = await Enquiry.findById(id);

      if (!enquiry) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Enquiry not found'
        });
      }

      res.json({ enquiry });
    } catch (error) {
      console.error('Get enquiry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve enquiry'
      });
    }
  }

  // Update enquiry follow-up details such as call time, comments, and status.
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { call_time, comments, status, next_followup_date } = req.body;

      const allowedStatuses = ['new', 'contacted', 'converted', 'closed', 'asked_for_next_followup'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Invalid status value'
        });
      }

      if (status === 'asked_for_next_followup' && !next_followup_date) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Next follow-up date is required when status is asked for next follow-up'
        });
      }

      const enquiry = await Enquiry.update(id, {
        call_time,
        comments,
        status,
        next_followup_date
      }, req.user.id);

      if (!enquiry) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Enquiry not found'
        });
      }

      res.json({
        message: 'Enquiry updated successfully',
        enquiry
      });
    } catch (error) {
      console.error('Update enquiry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update enquiry'
      });
    }
  }

  // Permanently delete an enquiry.
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const enquiry = await Enquiry.delete(id);

      if (!enquiry) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Enquiry not found'
        });
      }

      res.json({
        message: 'Enquiry deleted successfully',
        id: enquiry.id
      });
    } catch (error) {
      console.error('Delete enquiry error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete enquiry'
      });
    }
  }

  // Return enquiry counts for the enquiry dashboard cards.
  static async getStatistics(req, res) {
    try {
      const statistics = await Enquiry.getStatistics();
      res.json({ statistics });
    } catch (error) {
      console.error('Get enquiry statistics error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve enquiry statistics'
      });
    }
  }
}

module.exports = EnquiryController;
