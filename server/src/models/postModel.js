const db = require('../config/db.js');

// Get all posts with user info, comments count, and likes count
const getAllPosts = (callback) => {
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
    db.query(query, callback);
}
// Get posts by specific user with aggregated likes and comments counts
const getPostsByUser = (userId, callback) => {
    // Return posts for a specific user with aggregated likes and comments counts
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
    db.query(query, [userId], callback);
}

// Create post function with default user_id handling
const createPost = (post, callback) => {
  const { user_id, title, content, image_url, video_url } = post;
  
  // Default to user_id 1 if not provided
  const finalUserId = user_id || 1;
  
  console.log("Received post object:", post);
  console.log("Final user_id to use:", finalUserId);
  
  const query = "INSERT INTO posts (user_id, title, content, image_url, video_url) VALUES (?, ?, ?, ?, ?)";
  const values = [finalUserId, title, content, image_url, video_url];
  
  console.log("SQL Query:", query);
  console.log("SQL Values:", values);
  
  db.query(query, values, (err, result) => {
    callback(err, result);
  });
};
// Update post function with conditional media update
const updatePost = (id, post, callback) => {
  const { title, content, image_url, video_url } = post;
  
  console.log("Post ID:", id);
  console.log("Update data:", { title, content, image_url, video_url });

  let updateFields = [];
  let values = [];

  if (content !== undefined) {
    updateFields.push("content = ?");
    values.push(content);
  }
  if (title !== undefined) {
    updateFields.push("title = ?");
    values.push(title);
  }
  // Only update image if a new one was provided
  if (image_url !== undefined && image_url !== null) {
    updateFields.push("image_url = ?");
    values.push(image_url);
  }
  // Only update video if a new one was provided
  if (video_url !== undefined && video_url !== null) {
    updateFields.push("video_url = ?");
    values.push(video_url);
  }

  // Add the post ID at the end
  values.push(id);

  if (updateFields.length === 0) {
    console.warn("No fields to update");
    return callback(new Error("No fields to update"), null);
  }

  const query = `UPDATE posts SET ${updateFields.join(", ")} WHERE id = ?`;
  db.query(query, values, (err, result) => {
    callback(err, result);
  });
};
// Delete post function
const deletePost = (id, callback) => {
  db.query("DELETE FROM posts WHERE id=?", [id], callback);
};

module.exports = {
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    getPostsByUser
};