const prisma = require('../utils/prisma');

const getAllMovies = async (req, res) => {
  try {
    const { genre, platform, year, priceType, mediaType, search, sort = 'createdAt', order = 'desc', page = 1, limit = 12 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { director: { contains: search, mode: 'insensitive' } },
        { synopsis: { contains: search, mode: 'insensitive' } },
        { cast: { has: search } },
      ];
    }

    if (genre) where.genre = { has: genre };
    if (platform) where.platform = { has: platform };
    if (year) where.releaseYear = parseInt(year);
    if (priceType) where.priceType = priceType;
    if (mediaType) where.mediaType = mediaType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: order },
        include: {
          _count: { select: { reviews: true } },
          reviews: {
            where: { status: 'PUBLISHED' },
            select: { rating: true },
          },
        },
      }),
      prisma.movie.count({ where }),
    ]);

    const moviesWithAvgRating = movies.map((movie) => {
      const avgRating = movie.reviews.length > 0
        ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
        : 0;
      const { reviews, ...rest } = movie;
      return { ...rest, posterUrl: movie.thumbnail, averageRating: parseFloat(avgRating.toFixed(1)), totalReviews: movie._count.reviews };
    });

    res.json({
      success: true,
      data: moviesWithAvgRating,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movies.', error: error.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { status: 'PUBLISHED' },
          include: {
            user: { select: { id: true, name: true } },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true, watchlist: true } },
      },
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const avgRating = movie.reviews.length > 0
      ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
      : 0;

    res.json({
      success: true,
      data: { ...movie, posterUrl: movie.thumbnail, averageRating: parseFloat(avgRating.toFixed(1)), totalReviews: movie._count.reviews },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movie.', error: error.message });
  }
};

const createMovie = async (req, res) => {
  try {
    const { title, synopsis, genre, releaseYear, director, cast, platform, priceType, mediaType, streamingUrl, thumbnail } = req.body;

    const data = {
      title,
      synopsis,
      genre: genre || [],
      releaseYear: parseInt(releaseYear),
      director,
      cast: cast || [],
      platform: platform || [],
      priceType: priceType || 'FREE',
      streamingUrl: streamingUrl || null,
      thumbnail: thumbnail || null,
    };
    if (mediaType) data.mediaType = mediaType;

    const movie = await prisma.movie.create({ data });

    res.status(201).json({ success: true, message: 'Movie created successfully.', data: movie });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ success: false, message: 'Failed to create movie.', error: error.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, synopsis, genre, releaseYear, director, cast, platform, priceType, mediaType, streamingUrl, thumbnail } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (synopsis !== undefined) data.synopsis = synopsis;
    if (genre !== undefined) data.genre = genre;
    if (releaseYear !== undefined) data.releaseYear = parseInt(releaseYear);
    if (director !== undefined) data.director = director;
    if (cast !== undefined) data.cast = cast;
    if (platform !== undefined) data.platform = platform;
    if (priceType !== undefined) data.priceType = priceType;
    if (mediaType !== undefined) data.mediaType = mediaType;
    if (streamingUrl !== undefined) data.streamingUrl = streamingUrl;
    if (thumbnail !== undefined) data.thumbnail = thumbnail;

    const movie = await prisma.movie.update({
      where: { id },
      data,
    });

    res.json({ success: true, message: 'Movie updated successfully.', data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update movie.', error: error.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.movie.delete({ where: { id } });
    res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete movie.', error: error.message });
  }
};

const getFeaturedMovies = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: { where: { status: 'PUBLISHED' }, select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    });

    const moviesWithRating = movies.map((movie) => {
      const avgRating = movie.reviews.length > 0
        ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
        : 0;
      const { reviews, ...rest } = movie;
      return { ...rest, posterUrl: movie.thumbnail, averageRating: parseFloat(avgRating.toFixed(1)), totalReviews: movie._count.reviews };
    });

    res.json({ success: true, data: moviesWithRating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured movies.', error: error.message });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, getFeaturedMovies };
