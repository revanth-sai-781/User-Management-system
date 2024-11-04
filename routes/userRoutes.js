const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

//request to register a new User
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists, please try with different email!' });
    }

    //encrpyting the password with salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'User',
    });

    await newUser.save();
    res.status(201).json({ message: 'New User created successfully!!' });
});

//request for logging the user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
});

//request for handling only 'admin' can get the users
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//to get the specific user with user's id
router.get('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
    const user = await User.findById(req.params.id).select('-password'); 
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});

//request for deleting the specific user using id
router.delete('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
});

module.exports = router;
