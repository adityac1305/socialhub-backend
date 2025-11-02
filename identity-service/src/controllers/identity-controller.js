
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const logger = require('../utils/logger');
const validationRegistration = require('../utils/validation');
const generateTokens = require('../utils/generateToken');



// User Registration Controller


const registerUser = async (req, res) => {
    try{
        
        logger.info('User registration started');

        // Validating user input with validation utility
        const {error} = validationRegistration(req.body);
        if(error){
            logger.warn('Validation error', error.details[0].message);
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            });
        }


        // Assigning user input to variables
        const {username, email, password} = req.body;


        // Checking if user already exists
        let user = await User.findOne({username});
        if(user){
            logger.warn('User already exists');
            return res.status(400).json({
                success : false,
                message : 'User already exists'
            });
        };


        // Creating new user object
        user = new User({
            username,
            email,
            password
        });


        // Save user to database, 
        // Note - We did not hash the password over here , as we are doing it with pre save hook in the User model schema 
        await user.save();
        logger.info('User registration completed successfully', user._id);

        
        // Generating access token and refresh token from generateTokens utility
        const {accessToken, refreshToken} = await generateTokens(user);

        return res.status(201).json({
            success : true,
            message : 'User registered successfully',
            accessToken,
            refreshToken
        });

    }catch(error){
        logger.error('User registration error occurred', error);
        return res.status(500).json({
            success : false,
            message : 'Internal Server Error'
        });
    }
}


// User Login Controller




// User Refresh Token Controller




// User Logout Controller



module.exports = {
    registerUser
}