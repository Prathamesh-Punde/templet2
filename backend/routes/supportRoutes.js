const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/supportController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { supportTicketValidation } = require('../middleware/validation');

// Public routes - anyone can create a support ticket
router.post('/tickets/create', supportTicketValidation, SupportController.create);

// Protected routes - Customer Support and Super Admin only
router.get('/tickets', authenticate, authorize('customer_support', 'super_admin'), SupportController.getAll);
router.get('/tickets/my', authenticate, authorize('customer_support', 'super_admin'), SupportController.getMyTickets);
router.get('/tickets/statistics', authenticate, authorize('customer_support', 'super_admin'), SupportController.getStatistics);
router.get('/tickets/:id', authenticate, authorize('customer_support', 'super_admin'), SupportController.getById);
router.put('/tickets/:id', authenticate, authorize('customer_support', 'super_admin'), SupportController.update);
router.post('/tickets/:id/assign', authenticate, authorize('customer_support', 'super_admin'), SupportController.assign);
router.post('/tickets/:id/resolve', authenticate, authorize('customer_support', 'super_admin'), SupportController.resolve);
router.post('/tickets/:id/response', authenticate, authorize('customer_support', 'super_admin'), SupportController.addResponse);
router.delete('/tickets/:id', authenticate, authorize('super_admin'), SupportController.delete);

module.exports = router;
