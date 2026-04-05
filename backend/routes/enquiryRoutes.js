const express = require('express');
const router = express.Router();
const EnquiryController = require('../controllers/enquiryController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { enquiryCreateValidation, enquiryUpdateValidation } = require('../middleware/validation');

// Public route - contact us form submission
router.post('/', enquiryCreateValidation, EnquiryController.create);

// Protected routes - Enquiry Follow Up Executive and Super Admin only
router.get('/', authenticate, authorize('enquiry_follow_up_executive', 'super_admin'), EnquiryController.getAll);
router.get('/statistics', authenticate, authorize('enquiry_follow_up_executive', 'super_admin'), EnquiryController.getStatistics);
router.get('/:id', authenticate, authorize('enquiry_follow_up_executive', 'super_admin'), EnquiryController.getById);
router.put('/:id', authenticate, authorize('enquiry_follow_up_executive', 'super_admin'), enquiryUpdateValidation, EnquiryController.update);
router.delete('/:id', authenticate, authorize('super_admin'), EnquiryController.delete);

module.exports = router;
