const jwt = require('jsonwebtoken');
const logger = require('../utils/logger.js');


const validateAuthToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn("No token provided in request");
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.warn("Invalid token", error);
        return res.status(403).json({ message: 'Access Denied: Invalid Token' });
    }
};

module.exports = validateAuthToken;