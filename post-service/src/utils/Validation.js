const joi = require('joi');


const validationcheck =(data)=>{
    
    const schema = joi.object({
        username: joi.string().min(3).max(5000).required(),
     
    })
    return schema.validate(data);
};

module.exports = {validationcheck };