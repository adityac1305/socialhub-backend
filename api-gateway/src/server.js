
require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const redisClient = require('./config/redis');
const helmet = require('helmet');
const apiGatewayEndpointsRateLimiter = require('./middleware/api-gateway-redis-rate-limiter');
const proxyMiddleware = require('./middleware/proxy-middleware');



const app = express();
const PORT = process.env.PORT || 3000;


// Importing Redis client from config folder redis.js (already connects to Redis automatically)



// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());




app.use((req,res,next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${req.body}`);
    next();
});


app.use(apiGatewayEndpointsRateLimiter);


// Identity Service Proxy
app.use('/v1/auth', proxyMiddleware(process.env.IDENTITY_SERVICE_URL, {
    proxyReqOptDecorator: (proxyReqOptions, srcReq) => {
        proxyReqOptions.headers["Content-Type"] = "application/json";
        return proxyReqOptions;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from Identity Service: ${proxyRes.statusCode}`

        );
        return proxyResData;
    },
})
);




app.use(errorHandler);



app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`Identity Service is running on ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(` Redis URL ${process.env.REDIS_URL}`);
});