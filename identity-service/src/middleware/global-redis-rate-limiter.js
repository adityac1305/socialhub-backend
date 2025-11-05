
const {RateLimiterRedis} = require('rate-limiter-flexible');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');



// rate-limiter-flexible counts and limits the number of actions by key and protects from DoS and brute force attacks at any scale.
const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,   // Uses Redis to Store request data
    keyPrefix : 'middleware',   // Groups limiter keys in Redis. This helps identify or seperate this limiter's data from other redis data.
    points : 100,               // Number of requests allowed per key/IP or per user
    duration : 60,              // Time window in seconds for making 100 requests
    blockDuration : 60,         // Time window in seconds for blocking IP after reaching 100 requests in time window
});



const redisRateLimiterMiddleware = async (req, res, next) => {
    try{
        // Consumes a point from the rate limiter for each unique IP address that makes a request
        await rateLimiter.consume(req.ip);
        next();
    }catch(error){
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success : false, 
            message : 'Too many requests, please try again later' 
        });
    }
};



module.exports = redisRateLimiterMiddleware;