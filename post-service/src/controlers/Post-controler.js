const Post = require('../models/postModel');
const logger = require('../utils/logger.js');

// Create a new post
const createPost = async (req, res) => {
    logger.info("Create Post Endpoint Hit .........");

    try {
        const{mediaId,content} =req.body;
        const newlycreatedPost = new Post({
            user: req.user.userID,
            content:content,
            mediaId:mediaId || []

        });
        await newlycreatedPost.save();
        logger.info("Post Created Success Fully!");
        return res.status(201).json({
            success:true,
            message:"Post Created SuccessFully!!!"
        })

    } catch (error) {
        logger.warn("Error During creating Post",error);
        return res.status(500).json({
            success:false,
            message: " server error occured during post creation "
        })
        
    }
}
const getPost = async (req, res) => {
    // to be implemented
    try {
        
    } catch (error) {
        logger.warn("Error During fetching a Post",error);
        return res.status(500).json({
            success:false,
            message: " server error occured during post fetch "
        })
        
    }
}
const deletePost = async (req, res) => {
    // to be implemented
    try {
        
    } catch (error) {
        logger.warn("Error During deleting a Post",error);
        return res.status(500).json({
            success:false,
            message: " server error occured during post deletion "
        })
        
    }
}

module.exports =createPost;