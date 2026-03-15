const express = require('express');
const { body } = require('express-validator');
const { getAllReviews, getReviewById, createReview, updateReview, deleteReview, approveReview, toggleLike, getUserReviews } = require('../controllers/review.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', getAllReviews);
router.get('/my-reviews', authenticate, getUserReviews);
router.get('/:id', getReviewById);

router.post(
  '/',
  authenticate,
  [
    body('movieId').notEmpty().withMessage('Movie ID is required'),
    body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10'),
    body('content').trim().isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
  ],
  validate,
  createReview
);

router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

router.patch('/:id/status', authenticate, authorizeAdmin, approveReview);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;
