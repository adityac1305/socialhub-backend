
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const logger = require('../utils/logger');
const {validationRegistration, validateLogin} = require('../utils/validation');
const generateTokens = require('../utils/generateToken');

/*

The device ID is not provided by the browser or HTTP protocol. 
It must be generated and managed by the client and explicitly sent to your backend.

####################################################

It is generated in the following way in Frontend code:
We generate the UUID and store it in persistent client storage such as local storage.
local storage persists across browser sessions or cookies with long expiration.

let deviceId = localStorage.getItem('deviceId');
if(!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem('deviceId', deviceId);
}

####################################################

Then we send deviceId in the request header as follows to backend

fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-device-id': deviceId
  },
  body: JSON.stringify({ email, password })

});


*/

// The following code is used to get the device ID from the request headers passed from Postman tool
const getDeviceId = (req) => req.headers['x-device-id'] || 'default';


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


        const deviceId = getDeviceId(req);

        
        // Generating access token and refresh token from generateTokens utility
        const {accessToken, refreshToken} = await generateTokens(user, deviceId);

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

const loginUser = async (req, res) => {
    logger.info('User login endpoint called');
    try{
        // Validating user input with validation utility for login
        const {error} = validateLogin(req.body);
        if(error){
            logger.warn('Validation error', error.details[0].message);
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            });
        }

        // Assigning user input to variables
        const {email, password} = req.body;


        // Checking if user already exists
        let user = await User.findOne({email});
        if(!user){
            logger.warn('User does not exist, Invalid Username or Password');
            return res.status(400).json({
                success : false,
                message : 'User does not exist, Invalid Username or Password'
            });
        };


        // Checking if password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect){
            logger.warn('Password is incorrect, Invalid Password');
            return res.status(400).json({
                success : false,
                message : 'Password is incorrect, Invalid Password'
            });
        };


        // Assigning device id
        const deviceId = getDeviceId(req);

        // Generating access token and refresh token from generateTokens utility
        const {accessToken, refreshToken} = await generateTokens(user, deviceId);

        return res.status(200).json({
            success : true,
            message : 'User logged in successfully',
            accessToken,
            refreshToken
        });



    }catch(error){
        logger.error('User login error occurred', error);
        return res.status(500).json({
            success : false,
            message : 'Internal Server Error'
        });
    }
}



// User Refresh Token Controller
const refreshTokenUser = async (req, res) => {
    logger.info('User refresh token endpoint called');
    try{

        // Assigning user input to variables
        const {refreshToken} = req.body;
        const deviceId = getDeviceId(req);

        // Checking if refresh token is provided
        if(!refreshToken){
            logger.warn('Refresh token is missing');
            return res.status(400).json({
                success : false,
                message : 'Refresh token is missing'
            });
        };


        // Getting old refresh token from database and deleting it so we app can issue new tokens
        const storedToken = await RefreshToken.findOneAndDelete({token : refreshToken, deviceId});
        
        // Checking if refresh token is valid
        if(!storedToken || storedToken.expiresAt < Date.now()){
            logger.warn('Refresh token is invalid or expired');
            return res.status(401).json({
                success : false,
                message : 'Refresh token is invalid or expired'
            });
        };


        // Checking if user exists
        const user = await User.findById(storedToken.user);
        if(!user){
            logger.warn('User does not exist');
            return res.status(401).json({
                success : false,
                message : 'User does not exist'
            });
        };


        // Generating new access token and refresh token from generateTokens utility
        const {accessToken: newAccessToken, refreshToken: newRefreshToken} = await generateTokens(user, deviceId);

        res.json({
            success : true,
            message : 'Tokens refreshed successfully',
            accessToken : newAccessToken,
            refreshToken : newRefreshToken
        });

    }catch(error){
        logger.error('User refresh token error occurred', error);
        return res.status(500).json({
            success : false,
            message : 'Internal Server Error'
        });
    }
}



// User Logout Controller

const logoutUser = async (req, res) => {
    try{

        // Assigning user input to variables
        const {refreshToken} = req.body;
        const deviceId = getDeviceId(req);

        // Checking if refresh token is provided
        if(!refreshToken){
            logger.warn('Refresh token is missing');
            return res.status(400).json({
                success : false,
                message : 'Refresh token is missing'
            });
        };


        // Getting refresh token from database and deleting it
        const storedToken = await RefreshToken.findOneAndDelete({
            token : refreshToken,
            deviceId
        });
        

        // Checking if refresh token is valid
        if(!storedToken){
            logger.warn('Invalid Refresh Token Provided or Token was already deleted');
            return res.status(401).json({
                success : false,
                message : 'Invalid Refresh Token Provided or Token was already deleted'
            });
        };

        logger.info('User logged out successfully');
        res.json({
            success : true,
            message : 'User logged out successfully'
        })


    }catch(error){
        logger.error('Error Occurred During User Logout', error);
        return res.status(500).json({
            success : false,
            message : 'Internal Server Error'
        });
    }
}



module.exports = {
    registerUser,
    loginUser,
    refreshTokenUser,
    logoutUser
}