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

// Get all posts with user info, comments count, and likes count
const getAllPosts = async () => {
    const query = `
      SELECT p.*, 
        u.username,
        u.avatar AS avatar,
        COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comments,
        COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS likes
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;
    return await queryPromise(query);
};

// Get posts by specific user with aggregated likes and comments counts
const getPostsByUser = async (userId) => {
    const query = `
      SELECT p.*, 
        u.username,
        u.avatar AS avatar,
        COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comments,
        COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS likes
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    return await queryPromise(query, [userId]);
};

// Create post function with default user_id handling
const createPost = async (post) => {
  const { user_id, title, content, image_url, video_url } = post;
  const finalUserId = user_id || 1;
  const query = "INSERT INTO posts (user_id, title, content, image_url, video_url) VALUES (?, ?, ?, ?, ?)";
  const values = [finalUserId, title, content, image_url, video_url];
  return await queryPromise(query, values);
};

// Update post function with conditional media update
const updatePost = async (id, post) => {
  const { title, content, image_url, video_url } = post;
  const updateFields = [];
  const values = [];

  if (content !== undefined) {
    updateFields.push("content = ?");
    values.push(content);
  }
  if (title !== undefined) {
    updateFields.push("title = ?");
    values.push(title);
  }
  if (image_url !== undefined && image_url !== null) {
    updateFields.push("image_url = ?");
    values.push(image_url);
  }
  if (video_url !== undefined && video_url !== null) {
    updateFields.push("video_url = ?");
    values.push(video_url);
  }

  values.push(id);

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  const query = `UPDATE posts SET ${updateFields.join(", ")} WHERE id = ?`;
  return await queryPromise(query, values);
};

// Delete post function
const deletePost = async (id) => {
  return await queryPromise("DELETE FROM posts WHERE id=?", [id]);
};

module.exports = {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    getPostsByUser,
    queryPromise
};