const mongoose = require('mongoose');
const argon2 = require('argon2');

const userschema = new mongoose.Schema({
    username:{
        type: String,
        unique:true,
        trim:true,
        required: true
    },
    email:{
        type: String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true
    },
    password:{
        type: String,
        required:true,
        trim:true,

    },
    createdAt:{
        type: Date,
        default:Date.now
    }

},
{
    timestamps: true
});

userschema.pre('save', async function(next){
    if(this.isModified('password')){
       try {
         this.password = await argon2.hash(this.password)
       } catch (error) {
        return next(error);
        
       }
    }
  
})
userschema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password , candidatePassword)
    } catch (error) {
        throw error
        
    }
    
}
userschema.index({username: 'text'});

const User = mongoose.model('User', userschema);
module.exports = User;