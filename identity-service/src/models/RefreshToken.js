

const mongoose = require('mongoose');


const refreshTokenSchema = new mongoose.Schema({
    token : {
        type : String,
        required : true
    },

    // This field links each refresh token to a specific user document.
    // ObjectId references the _id field in the User collection
    // The ref: 'User' allows you to populate user data later

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    expiresAt : {
        type : Date,
        required : true
    }
},
{
    timestamps : true
}
);



// expiresAt : 1
// Creates a Time to Live (TTL) index on the expiresAt field
// Tells MongoDB to automatically delete documents after the expiresAt time passes

// expireAfterSeconds: 0
// The document will expire immediately once expiresAt is reached.


refreshTokenSchema.index({ expiresAt : 1 }, { expireAfterSeconds : 0 });


const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema, 'RefreshTokens');
module.exports = RefreshToken;