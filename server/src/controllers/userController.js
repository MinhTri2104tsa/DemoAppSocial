const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createUser,findUserByEmail,findUserById,updateUserById} = require('../models/userModel.js');
const {getIo} = require('../socket.js');

// User Registration
const registerUser = (req, res) => {
    const {username, email, password} = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
    }

    // Check if user already exists
    findUserByEmail(email, async (err, existingUser) => {
        if (err) return res.status(500).json({err: err.message});
        if (existingUser.length > 0) {
            return res.status(400).json({message: "User already exists"});
        }
        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = {username, email, password: hashedPassword};
        createUser(newUser, (err) => {
            if (err) return res.status(500).json({err: err.message});
            res.status(201).json({message: "User registered successfully"});
        });
    });
}
// User Login
const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // Find user by email
  findUserByEmail(email, async (err, users) => {
    if (err) return res.status(500).json({ err: err.message });
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const user = users[0];
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Create JWT with id (for MySQL - auto-increment primary key)
    const token = jwt.sign(
        { id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
}
// Get User Profile
const getProfile = (req, res) => {
  const userId = req.user?.id || req.userId;
  if (!userId) return res.status(401).json({ message: 'Authentication required' });
  findUserById(userId, (err, results) => {
    if (err) return res.status(500).json({ err: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = results[0];
    // do not send password
    const { password, ...safe } = user;
    res.json({ user: safe });
  });
}
// Update User Profile
const updateProfile = (req, res) => {
  const userId = req.user?.id || req.userId;
  if (!userId) return res.status(401).json({ message: 'Authentication required' });

  const { username, email } = req.body;
  let avatarPath;
  if (req.file) {
    avatarPath = `uploads/images/${req.file.filename}`;
  }

  const updateData = {};
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;
  if (avatarPath !== undefined) updateData.avatar = avatarPath;

  updateUserById(userId, updateData, (err, result) => {
    if (err) return res.status(500).json({ err: err.message });
    // return updated user
    findUserById(userId, (err2, rows) => {
      if (err2) return res.status(500).json({ err: err2.message });
      const user = rows[0];
      const { password, ...safe } = user;
      const io = getIo();
      if (io) io.emit('postsUpdated');
      res.json({ message: 'Profile updated', user: safe });
    });
  });
}
module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile
};