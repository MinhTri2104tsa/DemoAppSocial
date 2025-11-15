const {CommentModel} = require('../models/commentModel.js');
const {getIo} = require('../socket.js');


const getComments = (req, res) => {
    const {postId} = req.params;
    CommentModel.getCommentsByPostId(postId, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

const createComment = (req, res) => {
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
    CommentModel.createComment(data, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        // after creating comment, fetch latest comments for the post and emit via socket
        CommentModel.getCommentsByPostId(postId, (err2, results) => {
            if (err2) {
                console.error('Error fetching comments after create:', err2.message);
            } else {
                const io = getIo();
                if (io) io.emit('commentsUpdated', { postId, comments: results });
            }
            // respond to the creator regardless
            res.status(201).json({ message: "Comment created successfully", data });
        });
    });
};

const updateComment = (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Content required" });
    CommentModel.updateComment(id, userId, content, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ error: "Not authorized or comment not found" });

        // fetch post_id for this comment and emit latest comments for that post
        const db = require('../config/db.js');
        db.query('SELECT post_id FROM comments WHERE id = ?', [id], (err2, rows) => {
            if (err2) {
                console.error('Error fetching post_id after update:', err2.message);
                return res.status(200).json({ message: 'Comment updated' });
            }
            if (!rows || rows.length === 0) return res.status(200).json({ message: 'Comment updated' });
            const postId = rows[0].post_id;
            CommentModel.getCommentsByPostId(postId, (err3, results) => {
                const io = getIo();
                if (!err3 && io) io.emit('commentsUpdated', { postId, comments: results });
                res.status(200).json({ message: "Comment updated" });
            });
        });
    });
};

const deleteComment = (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    CommentModel.deleteComment(id, userId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(403).json({ error: "Not authorized or comment not found" });

        // Try to get postId from request body first for emission
        const postIdFromReq = req.body.postId || req.query.postId;
        if (postIdFromReq) {
            CommentModel.getCommentsByPostId(postIdFromReq, (err2, results) => {
                if (!err2) {
                    const io = getIo();
                    if (io) io.emit('commentsUpdated', { postId: postIdFromReq, comments: results });
                }
                res.status(200).json({ message: "Comment deleted successfully" });
            });
        } else {
            res.status(200).json({ message: "Comment deleted successfully" });
        }
    });
};
module.exports = {
    getComments,
    createComment,
    updateComment,
    deleteComment
};