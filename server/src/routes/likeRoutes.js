const express = require('express');
const { toggleLike, getLikes } = require('../controllers/likeController.js');
const {verifyToken} = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post("/", verifyToken, toggleLike);
router.get("/:postId", getLikes);
module.exports = router;