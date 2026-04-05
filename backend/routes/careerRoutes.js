const express = require('express');
const router = express.Router();
const CareerController = require('../controllers/careerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { careerValidation } = require('../middleware/validation');

// Public routes - anyone can view active careers
router.get('/active', CareerController.getActive);
router.post('/:id/apply', CareerController.submitApplication);
router.get('/public/:id', CareerController.getById);

// Protected routes - HR and Super Admin only
router.get('/applications', authenticate, authorize('hr', 'super_admin'), CareerController.getApplications);
router.put('/applications/:id/status', authenticate, authorize('hr', 'super_admin'), CareerController.updateApplicationStatus);
router.delete('/applications/:id', authenticate, authorize('hr', 'super_admin'), CareerController.deleteApplication);
router.get('/', authenticate, authorize('hr', 'super_admin'), CareerController.getAll);
router.get('/:id', authenticate, authorize('hr', 'super_admin'), CareerController.getById);
router.post('/', authenticate, authorize('hr', 'super_admin'), careerValidation, CareerController.create);
router.put('/:id', authenticate, authorize('hr', 'super_admin'), CareerController.update);
router.delete('/:id', authenticate, authorize('hr', 'super_admin'), CareerController.delete);

module.exports = router;
