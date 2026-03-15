const express = require('express');
const { body } = require('express-validator');
const { getCommentsByReview, createComment, deleteComment } = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/review/:reviewId', getCommentsByReview);

router.post(
  '/review/:reviewId',
  authenticate,
  [body('content').trim().notEmpty().withMessage('Comment content is required')],
  validate,
  createComment
);

router.delete('/:id', authenticate, deleteComment);

module.exports = router;
