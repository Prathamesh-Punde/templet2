const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All user management routes are super admin only
router.get('/', authenticate, authorize('super_admin'), UserController.getAll);
router.get('/:id', authenticate, authorize('super_admin'), UserController.getById);
router.put('/:id', authenticate, authorize('super_admin'), UserController.update);
router.delete('/:id', authenticate, authorize('super_admin'), UserController.delete);

module.exports = router;
