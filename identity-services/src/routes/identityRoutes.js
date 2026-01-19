const express = require("express");
const registeruser =require('../controlers/identityControler.js');
const router = express.Router();


router.post("/register", registeruser);

module.exports = router;
