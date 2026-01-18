const joi = require('joi');


const validationcheck =(data)=>{
    
    const schema = joi.object({
        username: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(50).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),

    })
    return schema.validate(data);
};
modules.exports = validationcheck;