const Customer = require('../models/Customer');

class CustomerController {
  static async getAll(req, res) {
    try {
      const { product, customer_name } = req.query;
      const filters = {};

      if (product) {
        filters.product = product;
      }

      if (customer_name) {
        filters.customer_name = customer_name;
      }

      const customers = await Customer.findAll(filters);

      res.json({
        count: customers.length,
        customers
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve customers'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Customer not found'
        });
      }

      res.json({ customer });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve customer'
      });
    }
  }

  static async create(req, res) {
    try {
      const customer = await Customer.create(req.body, req.user.id);

      res.status(201).json({
        message: 'Customer created successfully',
        customer
      });
    } catch (error) {
      console.error('Create customer error:', error);
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Customer ID already exists'
        });
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create customer'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.update(id, req.body);

      if (!customer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Customer not found'
        });
      }

      res.json({
        message: 'Customer updated successfully',
        customer
      });
    } catch (error) {
      console.error('Update customer error:', error);
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'Validation Failed',
          message: 'Customer ID already exists'
        });
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update customer'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Customer.delete(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Customer not found'
        });
      }

      res.json({
        message: 'Customer deleted successfully',
        id: deleted.id
      });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete customer'
      });
    }
  }
}

module.exports = CustomerController;
