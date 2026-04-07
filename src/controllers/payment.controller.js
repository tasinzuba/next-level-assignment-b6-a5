const SSLCommerzPayment = require('sslcommerz-lts');
const prisma = require('../utils/prisma');

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === 'true';

const PLAN_PRICES = {
  MONTHLY: { amount: 9.99, currency: 'USD' },
  YEARLY: { amount: 79.99, currency: 'USD' },
};

// POST /api/payment/initiate
const initiatePayment = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['MONTHLY', 'YEARLY'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan.' });
    }

    const existing = await prisma.subscription.findUnique({ where: { userId: req.user.id } });
    if (existing && existing.status === 'ACTIVE' && existing.endDate > new Date()) {
      return res.status(409).json({ success: false, message: 'You already have an active subscription.' });
    }

    const { amount, currency } = PLAN_PRICES[plan];
    const tranId = `SUB-${req.user.id}-${plan}-${Date.now()}`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

    const data = {
      total_amount: amount,
      currency,
      tran_id: tranId,
      success_url: `${serverUrl}/api/payment/success`,
      fail_url: `${serverUrl}/api/payment/fail`,
      cancel_url: `${serverUrl}/api/payment/cancel`,
      ipn_url: `${serverUrl}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: `${plan} Subscription`,
      product_category: 'Subscription',
      product_profile: 'non-physical-goods',
      cus_name: req.user.name || 'Customer',
      cus_email: req.user.email,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      // Store metadata in the tran_id itself
      value_a: req.user.id,
      value_b: plan,
      value_c: clientUrl,
    };

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return res.json({ success: true, url: apiResponse.GatewayPageURL });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to initiate payment.', details: apiResponse });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/success  (SSLCommerz POSTs here)
const paymentSuccess = async (req, res) => {
  try {
    const { val_id, value_a: userId, value_b: plan, value_c: clientUrl } = req.body;

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const validation = await sslcz.validate({ val_id });

    if (!validation || validation.status !== 'VALID') {
      return res.redirect(`${clientUrl}/subscription?payment=invalid`);
    }

    // Activate subscription
    const endDate = new Date();
    if (plan === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
    else if (plan === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);

    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing) {
      await prisma.subscription.update({
        where: { userId },
        data: { plan, status: 'ACTIVE', startDate: new Date(), endDate },
      });
    } else {
      await prisma.subscription.create({
        data: { plan, endDate, userId },
      });
    }

    res.redirect(`${clientUrl}/subscription?payment=success`);
  } catch (error) {
    const clientUrl = req.body.value_c || 'http://localhost:3001';
    res.redirect(`${clientUrl}/subscription?payment=error`);
  }
};

// POST /api/payment/fail
const paymentFail = async (req, res) => {
  const clientUrl = req.body.value_c || 'http://localhost:3001';
  res.redirect(`${clientUrl}/subscription?payment=failed`);
};

// POST /api/payment/cancel
const paymentCancel = async (req, res) => {
  const clientUrl = req.body.value_c || 'http://localhost:3001';
  res.redirect(`${clientUrl}/subscription?payment=cancelled`);
};

module.exports = { initiatePayment, paymentSuccess, paymentFail, paymentCancel };
