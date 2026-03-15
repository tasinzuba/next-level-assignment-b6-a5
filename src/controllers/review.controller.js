const prisma = require('../utils/prisma');

const getAllReviews = async (req, res) => {
  try {
    const { movieId, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    const where = { status: 'PUBLISHED' };
    if (movieId) where.movieId = movieId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: order },
        include: {
          user: { select: { id: true, name: true } },
          movie: { select: { id: true, title: true, thumbnail: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.', error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true, thumbnail: true, genre: true } },
        comments: {
          where: { parentId: null },
          include: {
            user: { select: { id: true, name: true } },
            replies: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch review.', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { movieId, rating, content, tags, spoiler } = req.body;

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId: req.user.id, movieId },
    });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this movie.' });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        content,
        tags: tags || [],
        spoiler: spoiler || false,
        userId: req.user.id,
        movieId,
      },
      include: {
        user: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Review submitted. Pending admin approval.', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create review.', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content, tags, spoiler } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews.' });
    }

    if (review.status === 'PUBLISHED') {
      return res.status(403).json({ success: false, message: 'Published reviews cannot be edited.' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(content && { content }),
        ...(tags && { tags }),
        ...(spoiler !== undefined && { spoiler }),
      },
    });

    res.json({ success: true, message: 'Review updated successfully.', data: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update review.', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews.' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete review.', error: error.message });
  }
};

const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PUBLISHED', 'UNPUBLISHED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be PUBLISHED or UNPUBLISHED.' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, message: `Review ${status.toLowerCase()} successfully.`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update review status.', error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_reviewId: { userId: req.user.id, reviewId: id } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.json({ success: true, message: 'Like removed.', liked: false });
    }

    await prisma.like.create({ data: { userId: req.user.id, reviewId: id } });
    res.json({ success: true, message: 'Review liked.', liked: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle like.', error: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: {
        movie: { select: { id: true, title: true, thumbnail: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your reviews.', error: error.message });
  }
};

module.exports = { getAllReviews, getReviewById, createReview, updateReview, deleteReview, approveReview, toggleLike, getUserReviews };
