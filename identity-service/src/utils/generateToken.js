
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');


// This function accepts a user object and will generate 2 tokens - access token and refresh token

const generateTokens = async (user) => {
    
    // Creates a JWT token containing user data as claims and signs it using JWT_SECRET

    const accessToken = jwt.sign({
        userId : user._id,
        username : user.username,
    }, process.env.JWT_SECRET, {expiresIn : '60m'});
    

    // Creates a long, random string.
    // Unlike JWT, this is not signed , its just unique secret value.
    // Used later to request new access tokens without logging in again.

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);


    // Saves the refresh token to the database
    await RefreshToken.create({
        token : refreshToken,
        user : user._id,
        expiresAt
    });

    return {accessToken, refreshToken};
};


module.exports = generateTokens;