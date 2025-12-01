const LikeModel = require('../models/likeModel.js');
const jwt = require('jsonwebtoken');
const {getIo} = require('../socket.js');

const toggleLike = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.body;

    if (!postId) return res.status(400).json({ message: 'Missing postId' });
    
    await LikeModel.toggleLike(postId, userId);
    
    // after toggling, return updated counts and liked state
    const info = await LikeModel.getLikesAndCheck(postId, userId);
    
    // emit socket event to notify clients about updated likes
    const io = getIo();
    if (io) {
      io.emit('postUpdated', { postId, totalLikes: info.totalLikes });
    }
    
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLikes = async (req, res) => {
  try {
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
    
    const info = await LikeModel.getLikesAndCheck(postId, userId);
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
    toggleLike,
    getLikes
};