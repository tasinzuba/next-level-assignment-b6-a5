const prisma = require('../utils/prisma');

const getCommentsByReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { reviewId, parentId: null },
      include: {
        user: { select: { id: true, name: true } },
        replies: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments.', error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content, parentId } = req.body;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found.' });
      }
    }

    const comment = await prisma.comment.create({
      data: { content, userId: req.user.id, reviewId, parentId: parentId || null },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, message: 'Comment posted.', data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to post comment.', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete comment.', error: error.message });
  }
};

module.exports = { getCommentsByReview, createComment, deleteComment };
