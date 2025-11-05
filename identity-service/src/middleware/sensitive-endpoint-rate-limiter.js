const expressrateLimit = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');


// IP based rate limiting for sensitive endpoints
const sensitveEndpointsRateLimiter = expressrateLimit({
    windowMs : 15 * 60 * 1000, // 15 minutes
    max : 5,                   // limit each IP to 5 requests per windowMs
    standardHeaders : true,    // Return rate limit info in the `RateLimit-*` headers for clients to see remaining quota.
    legacyHeaders : false,     // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn(` Sensitvie endpoint rate limit exceeded for IP: ${req.ip}`);  
        res.status(429).json({
            success : false, 
            message : 'Too many requests, please try again later' 
        });
    },

    // store tells the limiter where to store rate limit counters. 
    // Default is in-memory, but you can also use Redis, MongoDB, or any other store that implements the `RateLimitStore` interface.
    // RedisStore comes from rate-limit-storage npm, This is Redis based storage for rate limiter.
    // RedisStore needs to talk to redis and sendCommand is used to send commands to redis
    // The sendCommand method takes all the arguments and sends them to redis via redisClient.call method
    // the redisClient.call method is used to run any Redis command like GET, SET, INCR, DECR, EXPIRE etc (all)

    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    
});

module.exports = sensitveEndpointsRateLimiter;