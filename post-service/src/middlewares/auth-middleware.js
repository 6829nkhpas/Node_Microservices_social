const logger = require('../utils/logger.js');

const authenticateUser = (req, res, next) => {
    logger.info("Authenticating User...");

    // Simulated authentication logic
    const userID = req.headers['x-user-id'];
    if (!userID) {
        logger.warn("User ID not provided in headers");
        return res.status(401).json({
            success: false,
            message: "Unauthorized: User ID missing"
        });
    }
    req.user = { userID };
    next();
}

module.exports = authenticateUser;