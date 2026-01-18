const User = require('../models/Users.js');
const generateToken = require('../utils/generateToken.js');
const logger = require('../utils/logger.js');

const validationcheck = require('../utils/Validation.js');

const registeruser = async (req,res)=>{
    logger.info("Registration Endpoint Hit .........");
    try {
    const error = validationcheck(req.body);
    if(error){
        logger.warn("validation error",error.details[0].message);
        res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }
    logger.info("validation successful");
    const {username,email,password}=req.body;
    let userexist = await User.findOne({ $or: [ { username } , { email } ] });
    if(userexist){
        logger.alert("User Already exists!!!!!");
        res.status(400).json({
            success: false,
            message: "User Already Exists Try Login."
        })
    }
    userexist = new User(username,email,password);
    await userexist.save();
    logger.info("User Registered Successfully..",userexist._id);
    const {accessToken ,refreshstring} = await generateToken(userexist);
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
