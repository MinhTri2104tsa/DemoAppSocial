const db = require('../config/db.js');

// Promisify db.query
const queryPromise = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

const CommentModel = {
    getCommentsByPostId: async (postId) => {
        const query = `SELECT c.id, c.post_id, c.user_id, c.content, c.parent_comment_id, c.created_at, u.username
                       FROM comments c
                       JOIN users u ON c.user_id = u.id
                       WHERE c.post_id = ?
                       ORDER BY c.created_at ASC`;
        return await queryPromise(query, [postId]);
    },

    createComment: async (data) => {
        const query = "INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)";
        const parent = data.parent_comment_id || data.parentId || null;
        return await queryPromise(query, [data.postId, data.userId, data.content, parent]);
    },

    updateComment: async (id, userId, content) => {
        const query = "UPDATE comments SET content = ? WHERE id = ? AND user_id = ?";
        return await queryPromise(query, [content, id, userId]);
    },

    deleteComment: async (id, userId) => {
        const query = "DELETE FROM comments WHERE id = ? AND user_id = ?";
        return await queryPromise(query, [id, userId]);
    }
};

module.exports = CommentModel;