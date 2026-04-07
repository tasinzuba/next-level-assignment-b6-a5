const express = require('express');
const { body } = require('express-validator');
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, getFeaturedMovies } = require('../controllers/movie.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', getAllMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', getMovieById);

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('synopsis').trim().notEmpty().withMessage('Synopsis is required'),
    body('genre').isArray({ min: 1 }).withMessage('At least one genre is required'),
    body('releaseYear').isInt({ min: 1900, max: 2100 }).withMessage('Valid release year is required'),
    body('director').trim().notEmpty().withMessage('Director is required'),
    body('cast').isArray().withMessage('Cast must be an array'),
    body('platform').isArray().withMessage('Platform must be an array'),
    body('priceType').isIn(['FREE', 'PREMIUM']).withMessage('Price type must be FREE or PREMIUM'),
  ],
  validate,
  createMovie
);

router.put('/:id', authenticate, authorizeAdmin, updateMovie);
router.delete('/:id', authenticate, authorizeAdmin, deleteMovie);

module.exports = router;
