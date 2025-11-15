const db = require('../config/db.js');

const CommentModel = {
    getCommentsByPostId: (postId, callback) => {
        // join with users to get username and include parent_comment_id for threading
        const query = `SELECT c.id, c.post_id, c.user_id, c.content, c.parent_comment_id, c.created_at, u.username
                       FROM comments c
                       JOIN users u ON c.user_id = u.id
                       WHERE c.post_id = ?
                       ORDER BY c.created_at ASC`;
        db.query(query, [postId], callback);
    },
    createComment: (data, callback) => {
        const query = "INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)";
        const parent = data.parent_comment_id || data.parentId || null;
        db.query(query, [data.postId, data.userId, data.content, parent], callback);
    },
    updateComment: (id, userId, content, callback) => {
        // only allow author to update
        const query = "UPDATE comments SET content = ? WHERE id = ? AND user_id = ?";
        db.query(query, [content, id, userId], callback);
    },
    deleteComment: (id, userId, callback) => {
        const query = "DELETE FROM comments WHERE id = ? AND user_id = ?";
        db.query(query, [id, userId], callback);
    }
};
module.exports = CommentModel;