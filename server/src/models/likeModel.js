const db = require('../config/db.js');

const LikeModel = {
    toggleLike: (post_id, user_id, callback) => {
        const checkQuery = "SELECT * FROM likes WHERE post_id = ? AND user_id = ?";
        db.query(checkQuery, [post_id, user_id], (err, results) => {
            if (err) return callback(err);
            if (results.length > 0) {
                const deleteQuery = "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
                db.query(deleteQuery, [post_id, user_id], callback);
            } else {
                const insertQuery = "INSERT INTO likes (post_id, user_id) VALUES (?, ?)";
                db.query(insertQuery, [post_id, user_id], callback);
            }
        });
    },
    getLikesByPostId: (post_id, callback) => {
        const query = "SELECT COUNT(*) AS totalLikes FROM likes WHERE post_id = ?";
        db.query(query, [post_id], callback);
    }
    ,
    // Get total likes and whether a given user has liked the post
    getLikesAndCheck: (post_id, user_id, callback) => {
        const totalQuery = "SELECT COUNT(*) AS totalLikes FROM likes WHERE post_id = ?";
        db.query(totalQuery, [post_id], (err, totalRes) => {
            if (err) return callback(err);
            const totalLikes = totalRes[0]?.totalLikes || 0;
            if (!user_id) return callback(null, { totalLikes, likedByUser: false });
            const likedQuery = "SELECT COUNT(*) AS likedCount FROM likes WHERE post_id = ? AND user_id = ?";
            db.query(likedQuery, [post_id, user_id], (err2, likedRes) => {
                if (err2) return callback(err2);
                const likedByUser = (likedRes[0]?.likedCount || 0) > 0;
                callback(null, { totalLikes, likedByUser });
            });
        });
    }
};
module.exports = LikeModel;