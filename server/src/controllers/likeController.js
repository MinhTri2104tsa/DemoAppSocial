const {LikeModel} = require('../models/likeModel.js');
const jwt = require('jsonwebtoken');
const {getIo} = require('../socket.js');

const toggleLike = (req, res) => {
  const userId = req.userId;
  const { postId } = req.body;

  if (!postId) return res.status(400).json({ message: 'Missing postId' });
  LikeModel.toggleLike(postId, userId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    // after toggling, return updated counts and liked state
    LikeModel.getLikesAndCheck(postId, userId, (err2, info) => {
      if (err2) return res.status(500).json({ error: err2.message });
      // emit socket event to notify clients about updated likes
      const io = getIo();
      if (io) {
        io.emit('postUpdated', { postId, totalLikes: info.totalLikes });
      }
      res.status(200).json(info);
    });
  });
};

const getLikes = (req, res) => {
    const { postId } = req.params;
    // try to read optional token to check if current user liked the post
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader) {
      try {
        const tokenParts = authHeader.split(' ')[1];
  const decoded = jwt.verify(tokenParts, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // ignore token errors and treat as anonymous
        userId = null;
      }
    }
    LikeModel.getLikesAndCheck(postId, userId, (err, info) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(info);
    });
};

module.exports = {
    toggleLike,
    getLikes
};