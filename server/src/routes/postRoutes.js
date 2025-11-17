const express = require('express');

const { addPost, getPosts, editPost, removePost,getUserPosts } = require('../controllers/postController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/upload.js');

const router = express.Router();

// Get all posts
router.get('/', getPosts);
router.get("/user/:userId", getUserPosts);
// Create a new post with media upload handling
router.post('/create', verifyToken, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 10 }]),
    addPost
);
// Update an existing post with media upload handling
router.put('/:id', verifyToken, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 10 }]),
    editPost
);
// Delete a post
router.delete('/:id', verifyToken, removePost);

module.exports = router;