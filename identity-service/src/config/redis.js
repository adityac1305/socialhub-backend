

const Redis = require('ioredis');
const logger = require('../utils/logger');



const redisClient = new Redis({
    host : process.env.REDIS_HOST || 'localhost',
    port : process.env.REDIS_PORT || 6379,
    password : process.env.REDIS_PASSWORD || undefined,
    db : process.env.REDIS_DB || 0,
    retryStrategy : (times) => {
        return Math.min(times * 50, 2000);
    }
});


redisClient.on('connect', () => {
    logger.info(`Redis client connected and running on PORT: ${process.env.REDIS_PORT}`)
});


redisClient.on('error', (error) => {
    logger.error('Redis client connection error', error)
});


redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting')
});



module.exports = redisClient;