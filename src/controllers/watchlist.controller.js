const prisma = require('../utils/prisma');

const getWatchlist = async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        movie: {
          include: {
            reviews: { where: { status: 'PUBLISHED' }, select: { rating: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = watchlist.map((item) => {
      const avgRating = item.movie.reviews.length > 0
        ? item.movie.reviews.reduce((sum, r) => sum + r.rating, 0) / item.movie.reviews.length
        : 0;
      const { reviews, ...movie } = item.movie;
      return { ...item, movie: { ...movie, avgRating: parseFloat(avgRating.toFixed(1)) } };
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch watchlist.', error: error.message });
  }
};

const toggleWatchlist = async (req, res) => {
  try {
    const { movieId } = req.body;

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const existing = await prisma.watchlist.findUnique({
      where: { userId_movieId: { userId: req.user.id, movieId } },
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from watchlist.', added: false });
    }

    await prisma.watchlist.create({ data: { userId: req.user.id, movieId } });
    res.json({ success: true, message: 'Added to watchlist.', added: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update watchlist.', error: error.message });
  }
};

module.exports = { getWatchlist, toggleWatchlist };
