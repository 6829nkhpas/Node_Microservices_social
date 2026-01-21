const User = require('../models/Users.js');
const generateToken = require('../utils/generateToken.js');
const logger = require('../utils/logger.js');

const validationcheck = require('../utils/Validation.js');

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

module.exports = registeruser;
