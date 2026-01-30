const authenticateUser = require('../middlewares/auth-middleware.js');
const createPost = require('../controlers/Post-controler.js');

const express = require('express');
const router = express.Router();

// Route to create a new post
router.post('/posts', authenticateUser, createPost);

module.exports = router;