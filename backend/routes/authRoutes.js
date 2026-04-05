const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { loginValidation, registerValidation } = require('../middleware/validation');

// Public routes
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, AuthController.changePassword);

// Super admin only routes
router.post('/register', authenticate, authorize('super_admin'), registerValidation, AuthController.register);

module.exports = router;
