const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken.js");

const generateToken = async (user)=>{
    const accessToken = jwt.sign({
        userId: user.userId,
        username: user.username,
    },process.env.JWT_SECRET,{expiresIn: "15m" });

    const refreshstring = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate()+7);
    // creating the Refresh token

    await RefreshToken.create({
        Token:refreshstring,
        User: user._id,
        expiresAt:expiresAt
    })

    return {accessToken, refreshstring};

}

module.exports = generateToken;