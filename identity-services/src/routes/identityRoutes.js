const express = require("express");
const {registeruser,loginuser,refreshTokenuser,logoutuser} =require('../controlers/identityControler.js');


const router = express.Router();


router.post("/register", registeruser);
router.post("/login", loginuser);
router.post("/refresh-token", refreshTokenuser);
router.post("/logout", logoutuser);

module.exports = router;
