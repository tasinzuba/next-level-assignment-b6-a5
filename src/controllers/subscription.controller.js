const prisma = require('../utils/prisma');

const getMySubscription = async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription.', error: error.message });
  }
};

const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    const existing = await prisma.subscription.findUnique({ where: { userId: req.user.id } });
    if (existing && existing.status === 'ACTIVE' && existing.endDate > new Date()) {
      return res.status(409).json({ success: false, message: 'You already have an active subscription.' });
    }

    const endDate = new Date();
    if (plan === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    let subscription;
    if (existing) {
      subscription = await prisma.subscription.update({
        where: { userId: req.user.id },
        data: { plan, status: 'ACTIVE', startDate: new Date(), endDate },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: { plan, endDate, userId: req.user.id },
      });
    }

    res.status(201).json({ success: true, message: 'Subscription activated.', data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create subscription.', error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({ where: { userId: req.user.id } });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No subscription found.' });
    }

    await prisma.subscription.update({
      where: { userId: req.user.id },
      data: { status: 'INACTIVE' },
    });

    res.json({ success: true, message: 'Subscription cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel subscription.', error: error.message });
  }
};

module.exports = { getMySubscription, createSubscription, cancelSubscription };
