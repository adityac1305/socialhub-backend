

const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },


    content : {
        type : String,
        required : true
    },


    mediaIds : [
        {
            type : String
        }
    ],


    createdAt : {
        type : Date,
        default : Date.now
    }
}, {timestamps : true});

// In this project we will use the following index search via search-service
// We are just keeping it here for reference 
postSchema.index({content : 'text'});


const Post = mongoose.model('Post', postSchema, 'Posts');
module.exports = Post;