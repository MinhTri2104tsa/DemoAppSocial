const db = require('../config/db.js');
const {getIo} = require('../socket.js');
const { getAllPosts,getPostsByUser, createPost, updatePost , deletePost} = require('../models/postModel.js');


// Get all posts controller
const getPosts = (req, res) => {
    getAllPosts((err, result) => {
        if(err) return res.status(500).json(
            {error: err.message}
        );
    // Combine image_url and video_url into a single media array for frontend
    const posts = result.map(post => {
      let media = [];
      try {
        const imgs = post.image_url ? JSON.parse(post.image_url) : [];
        const vids = post.video_url ? JSON.parse(post.video_url) : [];
        if (Array.isArray(imgs)) media.push(...imgs.map(u => ({ type: 'image', url: u })));
        if (Array.isArray(vids)) media.push(...vids.map(u => ({ type: 'video', url: u })));
      } catch (e) {
        // fallback when stored as string
        if (post.image_url) media.push({ type: 'image', url: post.image_url });
        else if (post.video_url) media.push({ type: 'video', url: post.video_url });
      }
      return { ...post, media };
    });
        res.json(posts)
    })
}

// Create post controller
const addPost = (req, res) => {
  
  // Verify user is authenticated
  if (!req.userId && !req.user?.id) {
    console.error("NO USER ID FOUND!");
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = req.user?.id || req.userId;
  console.log("FINAL USER_ID TO USE:", userId);
  
  // handle multiple files: support both plural and singular field names
  console.log('REQ FILES KEYS:', Object.keys(req.files || {}));
  const imgs = req.files?.images || req.files?.image || [];
  const vids = req.files?.videos || req.files?.video || [];

  // normalize to arrays
  const imageFiles = Array.isArray(imgs) ? imgs : [imgs].filter(Boolean);
  const videoFiles = Array.isArray(vids) ? vids : [vids].filter(Boolean);

  const image_urls = imageFiles.map(f => `uploads/images/${f.filename}`);
  const video_urls = videoFiles.map(f => `uploads/videos/${f.filename}`);

  const newPost = {
    user_id: userId,
    title: req.body.title || null,
    content: req.body.content,
    image_url: image_urls.length ? JSON.stringify(image_urls) : null,
    video_url: video_urls.length ? JSON.stringify(video_urls) : null,
  };

  createPost(newPost, (err) => {
    if (err) {
      console.error("CREATE POST ERROR:", err.message);
      return res.status(500).json({ error: err.message });
    }
    // emit event so clients can refresh posts
    const io = getIo();
    if (io) io.emit('postsUpdated');
    console.log("POST CREATED SUCCESSFULLY");
    res.status(201).json({ message: "Thêm post thành công!" });
  });
};

const editPost = (req, res) => {
  const postId = req.params.id;
  const userId = req.user?.id || req.userId;

  console.log("EDIT POST - postId:", postId, "userId:", userId);

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Get post first to check if user is author
  const checkPostQuery = "SELECT user_id FROM posts WHERE id = ?";
  db.query(checkPostQuery, [postId], (err, results) => {
    if (err) {
      console.error(" GET POST ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = results[0];
    console.log("Post row:", post, "types:", typeof post.user_id, typeof userId);
    console.log("AUTH HEADER:", req.headers.authorization?.substring(0, 60));

    // Coerce to number before comparing to avoid string/number mismatch
    if (Number(post.user_id) !== Number(userId)) {
      console.error("UNAUTHORIZED - User is not the post author (type-mismatch check)", { dbUserId: post.user_id, tokenUserId: userId });
      return res.status(403).json({ error: "Unauthorized: Only post author can edit", details: { dbUserId: post.user_id, tokenUserId: userId } });
    }

    console.log(" REQUEST FILES:", req.files);
    console.log(" REQUEST BODY:", req.body);

    // If new images/videos uploaded, use them; otherwise leave as null (model will skip update)
  console.log('EDIT REQ FILES KEYS:', Object.keys(req.files || {}));
  const imgsNew = req.files?.images || req.files?.image || [];
  const vidsNew = req.files?.videos || req.files?.video || [];
  const imageFilesNew = Array.isArray(imgsNew) ? imgsNew : [imgsNew].filter(Boolean);
  const videoFilesNew = Array.isArray(vidsNew) ? vidsNew : [vidsNew].filter(Boolean);
  const image_urls_new = imageFilesNew.map(f => `uploads/images/${f.filename}`);
  const video_urls_new = videoFilesNew.map(f => `uploads/videos/${f.filename}`);

    const updatedPost = {
      title: req.body.title || null,
      content: req.body.content,
      image_url: image_urls_new.length ? JSON.stringify(image_urls_new) : null,
      video_url: video_urls_new.length ? JSON.stringify(video_urls_new) : null,
    };

    console.log("Updated post object:", updatedPost);

    updatePost(postId, updatedPost, (err, result) => {
      if (err) {
        console.error(" UPDATE POST ERROR:", err);
        return res.status(500).json({ error: err.message, sql: err.sqlMessage });
      }
      console.log('Update result:', result);
      const io = getIo();
      if (io) io.emit('postsUpdated');
      console.log(" POST UPDATED SUCCESSFULLY");
      res.json({ message: "Cập nhật post thành công!", result });
    });
  });
};
// Delete post controller
const removePost = (req, res) => {
  const postId = req.params.id;
  const userId = req.user?.id || req.userId;

  console.log("DELETE POST - postId:", postId, "userId:", userId);

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Get post first to check if user is author
  const checkPostQuery = "SELECT user_id FROM posts WHERE id = ?";
  db.query(checkPostQuery, [postId], (err, results) => {
    if (err) {
      console.error("GET POST ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = results[0];
    console.log("Post row:", post, "types:", typeof post.user_id, typeof userId);
    console.log("AUTH HEADER:", req.headers.authorization?.substring(0, 60));

    // Coerce to number before comparing to avoid string/number mismatch
    if (Number(post.user_id) !== Number(userId)) {
      console.error("UNAUTHORIZED - User is not the post author (type-mismatch check)", { dbUserId: post.user_id, tokenUserId: userId });
      return res.status(403).json({ error: "Unauthorized: Only post author can delete", details: { dbUserId: post.user_id, tokenUserId: userId } });
    }

    deletePost(postId, (err, result) => {
      if (err) {
        console.error(" DELETE POST ERROR:", err);
        return res.status(500).json({ error: err.message, sql: err.sqlMessage });
      }
      console.log('Delete result:', result);
      if (result && result.affectedRows === 0) {
        console.warn('Delete claimed success but affectedRows=0', result);
        return res.status(500).json({ error: 'Failed to delete post (no rows affected)' });
      }
      const io = getIo();
      if (io) io.emit('postsUpdated');
      console.log("POST DELETED SUCCESSFULLY");
      res.json({ message: "Xóa post thành công!" });
    });
  });
};
const getUserPosts = (req, res) => {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    getPostsByUser(userId, (err, result) => {
        if(err) return res.status(500).json({ error: err.message });
        
        // Combine image_url and video_url into a single media array for frontend
        const posts = result.map(post => {
          let media = [];
          try {
            const imgs = post.image_url ? JSON.parse(post.image_url) : [];
            const vids = post.video_url ? JSON.parse(post.video_url) : [];
            if (Array.isArray(imgs)) media.push(...imgs.map(u => ({ type: 'image', url: u })));
            if (Array.isArray(vids)) media.push(...vids.map(u => ({ type: 'video', url: u })));
          } catch (e) {
            // fallback when stored as string
            if (post.image_url) media.push({ type: 'image', url: post.image_url });
            else if (post.video_url) media.push({ type: 'video', url: post.video_url });
          }
          return { ...post, media };
        });
        res.json(posts);
    });
};
module.exports = {
    getPosts,
    addPost,
    editPost,
    removePost,
    getUserPosts
};