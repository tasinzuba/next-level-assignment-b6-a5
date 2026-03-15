const express = require('express');
const { body } = require('express-validator');
const { getMySubscription, createSubscription, cancelSubscription } = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', authenticate, getMySubscription);

router.post(
  '/',
  authenticate,
  [body('plan').isIn(['MONTHLY', 'YEARLY']).withMessage('Plan must be MONTHLY or YEARLY')],
  validate,
  createSubscription
);

router.delete('/', authenticate, cancelSubscription);

module.exports = router;
