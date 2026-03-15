const express = require('express');
const { body } = require('express-validator');
const { getWatchlist, toggleWatchlist } = require('../controllers/watchlist.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', authenticate, getWatchlist);

router.post(
  '/',
  authenticate,
  [body('movieId').notEmpty().withMessage('Movie ID is required')],
  validate,
  toggleWatchlist
);

module.exports = router;
