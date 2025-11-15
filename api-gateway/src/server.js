
require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const redisClient = require('./config/redis');
const helmet = require('helmet');
const apiGatewayEndpointsRateLimiter = require('./middleware/api-gateway-redis-rate-limiter');
const proxyMiddleware = require('./middleware/proxy-middleware');
const validateToken = require('./middleware/authMiddleware');
const proxy = require('express-http-proxy');


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



// Post Service Proxy

app.use('/v1/posts', validateToken, proxyMiddleware(process.env.POST_SERVICE_URL, {
    proxyReqOptDecorator: (proxyReqOptions, srcReq) => {
        proxyReqOptions.headers["Content-Type"] = "application/json";
        proxyReqOptions.headers["x-user-id"] = srcReq.user.userId;
        return proxyReqOptions;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from Post Service: ${proxyRes.statusCode}`

        );
        return proxyResData;
    },
})
);


// Media Service Proxy

app.use('/v1/media', validateToken, proxyMiddleware(process.env.MEDIA_SERVICE_URL, {
    proxyReqOptDecorator: (proxyReqOptions, srcReq) => {
        proxyReqOptions.headers["x-user-id"] = srcReq.user.userId;
        if(!srcReq.headers["content-type"].startsWith("multipart/form-data")){
            proxyReqOptions.headers["Content-Type"] = "application/json";
        }
        return proxyReqOptions;
    },

    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from Media Service: ${proxyRes.statusCode}`

        );
        return proxyResData;
    },
    parseReqBody: false,
})
);



app.use(errorHandler);



app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`Identity Service is running on ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service is running on ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media Service is running on ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(` Redis URL ${process.env.REDIS_URL}`);
});