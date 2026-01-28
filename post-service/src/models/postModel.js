const moongoose = require('mongoose');

const postSchema = new moongoose.Schema({
    user:{
        type: moongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content:{
        type: String,
        required: true
    },
    mediaId:{
        type: String
    },
    createdAt:{
        type: Date,
        default: Date.now
    }   
}, { timestamps: true });
const Post = moongoose.model('Post', postSchema);

module.exports = Post;