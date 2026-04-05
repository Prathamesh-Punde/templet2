const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication Failed',
          message: 'Invalid email or password' 
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ 
          error: 'Authentication Failed',
          message: 'Your account has been disabled' 
        });
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Authentication Failed',
          message: 'Invalid email or password' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Return user data and token (excluding password)
      const { password: _, ...userData } = user;
      
      res.json({
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Login failed' 
      });
    }
  }

  // Register (only accessible by super admin)
  static async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Registration Failed',
          message: 'User with this email already exists' 
        });
      }

      // Create new user
      const newUser = await User.create({ username, email, password, role });

      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Registration failed' 
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found' 
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to get profile' 
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findByEmail(req.user.email);
      
      // Verify current password
      const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ 
          error: 'Password Change Failed',
          message: 'Current password is incorrect' 
        });
      }

      // Update password
      await User.updatePassword(req.user.id, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to change password' 
      });
    }
  }

  // Logout (client-side token removal, optional server-side blacklisting)
  static async logout(req, res) {
    // In a more advanced implementation, you could add token blacklisting here
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = AuthController;
