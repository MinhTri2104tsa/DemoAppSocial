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

const LikeModel = {
    toggleLike: async (post_id, user_id) => {
        const checkQuery = "SELECT * FROM likes WHERE post_id = ? AND user_id = ?";
        const results = await queryPromise(checkQuery, [post_id, user_id]);
        
        if (results.length > 0) {
            const deleteQuery = "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
            return await queryPromise(deleteQuery, [post_id, user_id]);
        } else {
            const insertQuery = "INSERT INTO likes (post_id, user_id) VALUES (?, ?)";
            return await queryPromise(insertQuery, [post_id, user_id]);
        }
    },

    getLikesByPostId: async (post_id) => {
        const query = "SELECT COUNT(*) AS totalLikes FROM likes WHERE post_id = ?";
        return await queryPromise(query, [post_id]);
    },

    // Get total likes and whether a given user has liked the post
    getLikesAndCheck: async (post_id, user_id) => {
        const totalQuery = "SELECT COUNT(*) AS totalLikes FROM likes WHERE post_id = ?";
        const totalRes = await queryPromise(totalQuery, [post_id]);
        const totalLikes = totalRes[0]?.totalLikes || 0;
        
        if (!user_id) {
            return { totalLikes, likedByUser: false };
        }
        
        const likedQuery = "SELECT COUNT(*) AS likedCount FROM likes WHERE post_id = ? AND user_id = ?";
        const likedRes = await queryPromise(likedQuery, [post_id, user_id]);
        const likedByUser = (likedRes[0]?.likedCount || 0) > 0;
        
        return { totalLikes, likedByUser };
    }
};

module.exports = LikeModel;