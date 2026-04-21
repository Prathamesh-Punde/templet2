const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { customerCreateValidation, customerUpdateValidation } = require('../middleware/validation');

// All customer management routes are super admin only
router.get('/', authenticate, authorize('super_admin'), CustomerController.getAll);
router.get('/:id', authenticate, authorize('super_admin'), CustomerController.getById);
router.post('/', authenticate, authorize('super_admin'), customerCreateValidation, CustomerController.create);
router.put('/:id', authenticate, authorize('super_admin'), customerUpdateValidation, CustomerController.update);
router.delete('/:id', authenticate, authorize('super_admin'), CustomerController.delete);

module.exports = router;
