const CommentModel = require('../models/commentModel.js');
const {getIo} = require('../socket.js');

// Promisify db.query for direct queries
const db = require('../config/db.js');
const queryPromise = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

const getComments = async (req, res) => {
    try {
        const {postId} = req.params;
        const results = await CommentModel.getCommentsByPostId(postId);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createComment = async (req, res) => {
    try {
        // Accept both postId (camelCase) and post_id (snake_case)
        const postId = req.body.postId || req.body.post_id;
        const userId = req.userId;
        const { content } = req.body;
        // allow optional parent id for replies
        const parent_comment_id = req.body.parent_comment_id || req.body.parentId || null;

        // Validation
        if (!postId || !userId || !content) {
            return res.status(400).json({ 
                error: "Missing required fields",
                received: { postId, userId, content, token: req.headers.authorization?.substring(0, 20) }
            });
        }

        const data = { postId, userId, content, parent_comment_id };
        await CommentModel.createComment(data);
        
        // after creating comment, fetch latest comments for the post and emit via socket
        const results = await CommentModel.getCommentsByPostId(postId);
        const io = getIo();
        if (io) io.emit('commentsUpdated', { postId, comments: results });
        
        // respond to the creator
        res.status(201).json({ message: "Comment created successfully", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: "Content required" });
        
        const result = await CommentModel.updateComment(id, userId, content);
        if (result.affectedRows === 0) return res.status(403).json({ error: "Not authorized or comment not found" });

        // fetch post_id for this comment and emit latest comments for that post
        const rows = await queryPromise('SELECT post_id FROM comments WHERE id = ?', [id]);
        
        if (!rows || rows.length === 0) {
            return res.status(200).json({ message: 'Comment updated' });
        }
        
        const postId = rows[0].post_id;
        const results = await CommentModel.getCommentsByPostId(postId);
        const io = getIo();
        if (io) io.emit('commentsUpdated', { postId, comments: results });
        
        res.status(200).json({ message: "Comment updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const result = await CommentModel.deleteComment(id, userId);
        if (result.affectedRows === 0) return res.status(403).json({ error: "Not authorized or comment not found" });

        // Try to get postId from request body first for emission
        const postIdFromReq = req.body.postId || req.query.postId;
        if (postIdFromReq) {
            const results = await CommentModel.getCommentsByPostId(postIdFromReq);
            const io = getIo();
            if (io) io.emit('commentsUpdated', { postId: postIdFromReq, comments: results });
        }
        
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment
};
