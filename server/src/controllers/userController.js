const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createUser,findUserByEmail,findUserById,updateUserById} = require('../models/userModel.js');
const {getIo} = require('../socket.js');

// User Registration
const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        // Email syntax validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({message: "Email không hợp lệ"});
        }

        // Password strength validation: ít nhất 8 ký tự, có hoa, có thường, có ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và ký tự đặc biệt"});
        }

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({message: "Email đã được sử dụng"});
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {username, email, password: hashedPassword};
        await createUser(newUser);
        
        res.status(201).json({message: "User registered successfully"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

// Check email availability (syntax + existence)
const checkEmailAvailability = async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });

        const existingUser = await findUserByEmail(email);
        const exists = existingUser.length > 0;
        res.json({ exists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user by email
        const users = await findUserByEmail(email);
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
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) return res.status(401).json({ message: 'Authentication required' });

        const results = await findUserById(userId);
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        // do not send password
        const { password, ...safe } = user;
        res.json({ user: safe });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

// Update User Profile
const updateProfile = async (req, res) => {
    try {
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

        await updateUserById(userId, updateData);
        
        // return updated user
        const rows = await findUserById(userId);
        const user = rows[0];
        const { password, ...safe } = user;
        
        const io = getIo();
        if (io) io.emit('postsUpdated');
        
        res.json({ message: 'Profile updated', user: safe });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    checkEmailAvailability
};