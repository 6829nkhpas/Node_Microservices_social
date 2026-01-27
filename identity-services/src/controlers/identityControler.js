
const User = require('../models/Users.js');
const generateToken = require('../utils/generateToken.js');
const logger = require('../utils/logger.js');

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
     const user = User.findOne(email);
     if(!user){
         logger.warn("User not found .....");
         res.status(400).json({
             success: false,
             message:"Invalid credentials please try Again"
         })
     }
     const passwordCheck = user.comparePassword(password);
     if(!passwordCheck){
         logger.warn("Inccorent password Entered .....");
         res.status(400).json({
             success: false,
             message:"Inccorent password please try Again"
         })
     }
     const {accessToken,refreshstring}= generateToken(user);
     logger.info("Login success full",user._id);
     res.status(201).json({
         success:true,
         message:"Login sccuessful ...",
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

module.exports = {registeruser,loginuser};
