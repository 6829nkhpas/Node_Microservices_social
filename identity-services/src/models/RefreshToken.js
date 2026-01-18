const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    Token:{
        type: String,
        required: true,
    },
    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    expiresAt:{
        type: Date,
        required: true
    },
},
{ timestamps: true });

TokenSchema.index({ expiresAt: 1 }, {expireAfterSeconds: 0});
const RefreshToken= mongoose.model("RefreshToken",TokenSchema);
 module.exports = RefreshToken;