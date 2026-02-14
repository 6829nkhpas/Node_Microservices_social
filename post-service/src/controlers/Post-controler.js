const Post = require('../models/postModel');
const logger = require('../utils/logger.js');
const validationcheck = require('../utils/Validation.js');

// Create a new post
const createPost = async (req, res) => {
    logger.info("Create Post Endpoint Hit .........");

    try {
        const validationResult = validationcheck(req.body);
        if (validationResult.error) {
            logger.warn("Validation error during post creation", validationResult.error.details);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                details: validationResult.error.details
            });
        }
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePicture')
            .populate('mediaId');

        logger.info("Posts fetched successfully!");
        return res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: posts
        });
        
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