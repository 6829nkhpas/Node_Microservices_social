const logger  = require("../utils/logger");


const errorhandler = (err,req,res) =>{
    logger.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: "Internal Server Error"

    })
};

module.exports = errorhandler;