const express = require('express');
const {getComments, createComment, updateComment, deleteComment} = require('../controllers/commentController.js');
const {verifyToken} = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get comments for a specific post
router.get('/:postId', getComments);
// Create a new comment
router.post('/', verifyToken, createComment);
// Update an existing comment
router.put('/:id', verifyToken, updateComment);
// Delete a comment
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;