const Support = require('../models/Support');

class SupportController {
  // Get all support tickets
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

  // Get my assigned tickets
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

  // Get ticket by ID
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

  // Create new support ticket (public endpoint)
  static async create(req, res) {
    try {
      const ticketData = req.body;
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

  // Update ticket
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

  // Assign ticket to user
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

  // Resolve ticket
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

  // Add response to ticket
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

  // Delete ticket
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

  // Get ticket statistics
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
