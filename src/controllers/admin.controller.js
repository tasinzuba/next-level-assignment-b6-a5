const prisma = require('../utils/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalMovies, totalReviews, pendingReviews, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.review.count({ where: { status: 'PUBLISHED' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE', endDate: { gt: new Date() } } }),
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalMovies, totalReviews, pendingReviews, activeSubscriptions },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.', error: error.message });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { status: 'PENDING' },
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { id: true, name: true, email: true } },
          movie: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.review.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending reviews.', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
          _count: { select: { reviews: true, watchlist: true } },
          subscription: { select: { plan: true, status: true, endDate: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be USER or ADMIN.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ success: true, message: 'User role updated.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role.', error: error.message });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        reviews: { where: { status: 'PUBLISHED' }, select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    });

    const moviesWithRating = movies
      .map((movie) => {
        const avgRating = movie.reviews.length > 0
          ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
          : 0;
        const { reviews, ...rest } = movie;
        return { ...rest, avgRating: parseFloat(avgRating.toFixed(1)) };
      })
      .filter((m) => m._count.reviews > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);

    res.json({ success: true, data: moviesWithRating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch top rated movies.', error: error.message });
  }
};

module.exports = { getDashboardStats, getPendingReviews, getAllUsers, updateUserRole, getTopRatedMovies };
