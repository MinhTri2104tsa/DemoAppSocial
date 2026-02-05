const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, checkEmailAvailability } = require('../controllers/userController.js');
const { verifyToken } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/upload.js');

// User Registration
router.post('/register', registerUser);
// User Login
router.post('/login', loginUser);
// Check email availability
router.get('/check-email', checkEmailAvailability);
// Get User Profile
router.get('/me', verifyToken, getProfile);
// Update User Profile
router.put('/me', verifyToken, upload.single('avatar'), updateProfile);

module.exports = router;