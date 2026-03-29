const express = require('express');
const { initiatePayment, paymentSuccess, paymentFail, paymentCancel } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/initiate', authenticate, initiatePayment);

// SSLCommerz posts to these — no auth needed
router.post('/success', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);

module.exports = router;
