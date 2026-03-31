const express = require('express');
const { getDashboardStats, getPendingReviews, getAllUsers, updateUserRole, getTopRatedMovies } = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/reviews/pending', getPendingReviews);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/movies/top-rated', getTopRatedMovies);

module.exports = router;
