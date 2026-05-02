const User = require('../models/User');

class UserController {
  // Get all users
  // Return every admin user for the super admin panel.
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      res.json({ 
        count: users.length,
        users 
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve users' 
      });
    }
  }

  // Get user by ID
  // Return a single admin user by ID.
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to retrieve user' 
      });
    }
  }

  // Update user
  // Update an admin user's profile or role.
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await User.update(id, userData);

      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to update user' 
      });
    }
  }

  // Delete user
  // Delete an admin user, except the currently logged-in user.
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'You cannot delete your own account' 
        });
      }

      const user = await User.delete(id);

      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }

      res.json({ 
        message: 'User deleted successfully',
        id: user.id 
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to delete user' 
      });
    }
  }
}

module.exports = UserController;
