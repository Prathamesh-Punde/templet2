const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation Error',
      errors: errors.array() 
    });
  }
  next();
};

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Register validation
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['hr', 'customer_support', 'enquiry_follow_up_executive', 'super_admin'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

// Public enquiry validation
const enquiryCreateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
  handleValidationErrors
];

// Admin enquiry update validation
const enquiryUpdateValidation = [
  body('call_time')
    .trim()
    .notEmpty()
    .withMessage('Call time is required'),
  body('comments')
    .trim()
    .notEmpty()
    .withMessage('Comments are required'),
  body('status')
    .isIn(['new', 'contacted', 'converted', 'closed', 'asked_for_next_followup'])
    .withMessage('Invalid status value'),
  body('next_followup_date')
    .custom((value, { req }) => {
      if (req.body.status === 'asked_for_next_followup' && !value) {
        throw new Error('Next follow-up date is required when status is asked for next follow-up');
      }
      return true;
    }),
  handleValidationErrors
];

// Career validation
const careerValidation = [
  body('job_title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('employment_type')
    .trim()
    .notEmpty()
    .withMessage('Employment type is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('requirements')
    .trim()
    .notEmpty()
    .withMessage('Requirements are required'),
  body('responsibilities')
    .trim()
    .notEmpty()
    .withMessage('Responsibilities are required'),
  handleValidationErrors
];

// Support ticket validation
const supportTicketValidation = [
  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('customer_email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
  handleValidationErrors
];

module.exports = {
  loginValidation,
  registerValidation,
  careerValidation,
  supportTicketValidation,
  enquiryCreateValidation,
  enquiryUpdateValidation,
  handleValidationErrors
};
