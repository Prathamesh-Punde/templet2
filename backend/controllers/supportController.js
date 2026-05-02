const Support = require('../models/Support');

class SupportController {
  // Return all support tickets, optionally filtered by status, assignee, or priority.
  static async getAll(req, res) {
    try {
      const { status, assigned_to, priority } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (assigned_to) filters.assigned_to = parseInt(assigned_to);
      if (priority) filters.priority = priority;

      const tickets = await Support.findAll(filters);
      res.json({ 
        count: tickets.length,
        tickets 
      });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve tickets' 
      });
    }
  }

  // Return support tickets assigned to the current logged-in user.
  static async getMyTickets(req, res) {
    try {
      const tickets = await Support.findAll({ assigned_to: req.user.id });
      res.json({ 
        count: tickets.length,
        tickets 
      });
    } catch (error) {
      console.error('Get my tickets error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve tickets' 
      });
    }
  }

  // Return one support ticket and its response history.
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Support.findById(id);

      if (!ticket) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Ticket not found' 
        });
      }

      // Get ticket responses
      const responses = await Support.getResponses(id);

      res.json({ 
        ticket,
        responses 
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve ticket' 
      });
    }
  }

  // Create a public support ticket from the support form.
  static async create(req, res) {
    try {
      const ticketData = {
        customer_name: req.body.customer_name,
        customer_email: req.body.customer_email,
        customer_phone: req.body.customer_phone,
        subject: req.body.software_name || req.body.subject,
        message: req.body.problem_description || req.body.message,
        priority: req.body.priority
      };

      const ticket = await Support.create(ticketData);

      res.status(201).json({
        message: 'Support ticket created successfully',
        ticket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to create ticket' 
      });
    }
  }

  // Track a support ticket using tracking ID and customer mobile number.
  static async trackTicket(req, res) {
    try {
      const { ticket_number, mobile_no } = req.body;

      if (!ticket_number || !String(ticket_number).trim()) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Tracking ID is required'
        });
      }

      if (!mobile_no || !String(mobile_no).trim()) {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Mobile number is required'
        });
      }

      const normalizedTicketNumber = ticket_number.trim();
      const normalizedMobile = mobile_no.trim();

      const ticket = await Support.findByTrackingNumber(normalizedTicketNumber);

      if (!ticket) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Tracking ID not found'
        });
      }

      const isRegisteredCustomer = await Support.isCustomerMobileRegistered(normalizedMobile);
      if (!isRegisteredCustomer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Mobile number is not registered in our customer records'
        });
      }

      const phoneMatches =
        String(ticket.customer_phone || '').replace(/\D/g, '') ===
        normalizedMobile.replace(/\D/g, '');

      if (!phoneMatches) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Mobile number does not match this tracking ID'
        });
      }

      res.json({
        message: 'Ticket found',
        ticket: {
          ticket_number: ticket.ticket_number,
          customer_name: ticket.customer_name,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          resolved_at: ticket.resolved_at
        }
      });
    } catch (error) {
      console.error('Track ticket error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to track ticket'
      });
    }
  }

  // Update support ticket status or assignment fields.
  static async update(req, res) {
    try {
      const { id } = req.params;
      const ticketData = req.body;

      const ticket = await Support.update(id, ticketData);

      if (!ticket) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Ticket not found' 
        });
      }

      res.json({
        message: 'Ticket updated successfully',
        ticket
      });
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to update ticket' 
      });
    }
  }

  // Assign a support ticket to a specific user or the current user.
  static async assign(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      const ticket = await Support.assign(id, user_id || req.user.id);

      if (!ticket) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Ticket not found' 
        });
      }

      res.json({
        message: 'Ticket assigned successfully',
        ticket
      });
    } catch (error) {
      console.error('Assign ticket error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to assign ticket' 
      });
    }
  }

  // Mark a support ticket as resolved and store resolver info.
  static async resolve(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Support.resolve(id, req.user.id);

      if (!ticket) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Ticket not found' 
        });
      }

      res.json({
        message: 'Ticket resolved successfully',
        ticket
      });
    } catch (error) {
      console.error('Resolve ticket error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to resolve ticket' 
      });
    }
  }

  // Add a public or internal response to a support ticket.
  static async addResponse(req, res) {
    try {
      const { id } = req.params;
      const { response, is_internal } = req.body;

      const ticketResponse = await Support.addResponse(
        id, 
        req.user.id, 
        response, 
        is_internal || false
      );

      res.status(201).json({
        message: 'Response added successfully',
        response: ticketResponse
      });
    } catch (error) {
      console.error('Add response error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to add response' 
      });
    }
  }

  // Permanently delete a support ticket.
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Support.delete(id);

      if (!ticket) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Ticket not found' 
        });
      }

      res.json({ 
        message: 'Ticket deleted successfully',
        id: ticket.id 
      });
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to delete ticket' 
      });
    }
  }

  // Return support ticket summary counts for the dashboard.
  static async getStatistics(req, res) {
    try {
      const stats = await Support.getStatistics();
      res.json({ statistics: stats });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve statistics' 
      });
    }
  }
}

module.exports = SupportController;
