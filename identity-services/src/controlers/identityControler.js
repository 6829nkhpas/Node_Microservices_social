
const User = require('../models/Users.js');
const generateToken = require('../utils/generateToken.js');
const logger = require('../utils/logger.js');
const RefreshToken = require('../models/RefreshToken.js');

const {validationcheck,logincheck} = require('../utils/Validation.js');

const registeruser = async (req,res)=>{
    logger.info("Registration Endpoint Hit .........");
    try {
    const {error, value} = validationcheck(req.body);
    if(error){
        logger.warn("validation error",error.details[0].message);
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }
    logger.info("validation successful");
    const {username,email,password}=req.body;
    let userexist = await User.findOne({ $or: [ { username } , { email } ] });
    if(userexist){
        logger.warn("User Already exists!!!!!");
        return res.status(400).json({
            success: false,
            message: "User Already Exists Try Login."
        })
    }
    const newUser = new User({username, email, password});
    await newUser.save();
    logger.info("User Registered Successfully..", newUser._id);
    const {accessToken ,refreshstring} = await generateToken(newUser);
    res.status(201).json({

        success:true,
        message: "User Registered Successfully....",
        accessToken,
        refreshstring
    })

    } catch (error) {
        logger.error("Restration failed error",error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
        
    }
}

//Login User
const loginuser = async (req,res)=>{
    logger.info("Logging end point Hit...............");
   try {
     const {error,value} = logincheck(req.body);
     if(error){
         logger.warn("validation error",error.details[0].message);
         return res.status(400).json({
             success: false,
             message: error.details[0].message
         })
     }
     logger.info("validation successful");
     const {email,password} = req.body;
     const user = await User.findOne({email});
     if(!user){
         logger.warn("User not found .....");
         return res.status(400).json({
             success: false,
             message:"Invalid credentials please try Again"
         })
     }
     const passwordCheck = await user.comparePassword(password);
     if(!passwordCheck){
         logger.warn("Incorrect password Entered .....");
         return res.status(400).json({
             success: false,
             message:"Incorrect password please try Again"
         })
     }
     const {accessToken,refreshstring}= await generateToken(user);
     logger.info("Login successful",user.username);
     res.status(200).json({
         success:true,
         message:"Login successful ...",
         accessToken,
         refreshstring,
         userId:user._id
     })
   } catch (error) {
        logger.error("Login failed failed error",error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
        
    }
}
//refresh token

const refreshTokenuser = async (req,res)=>{
    logger.info("Refresh Token Endpoint Hit .........");
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("No refresh token provided");
            return res.status(400).json({
                success: false,
                message: "No refresh token provided"
            });
        }
        // Further logic to validate and issue new tokens goes here
        const storedToken = await RefreshToken.findOne({ Token: refreshToken });
        if (!storedToken || storedToken.expiresAt <  Date.now()) {
            logger.warn("Invalid or expired refresh token");
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }
        const user = await User.findById(storedToken.User);
        if (!user) {
            logger.warn("User not found for the provided refresh token");
             await RefreshToken.deleteOne({ _id: storedToken._id });
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
         await RefreshToken.deleteOne({ _id: storedToken._id });
        const { accessToken, refreshstring } = await generateToken(user);
       
        logger.info("Refresh token successful", user.username);
        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken,
            refreshstring
        });
    } catch (error) {
        logger.error("Refresh Token failed error",error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
    
module.exports = {registeruser,loginuser,refreshTokenuser};
