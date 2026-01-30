const Post = require('../models/postModel');
const logger = require('../utils/logger.js');
 const Post =require("../models/postModel.js");
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


module.exports =createPost;