//middleware for handling HTTP requests
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Unauthorized, access denied' });
    
    //accessing and validating jwt bearer token
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden error' });
        req.user = user;
        next();
    });
};

//validating only 'admin' can access the user details
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { authenticate, authorizeAdmin };