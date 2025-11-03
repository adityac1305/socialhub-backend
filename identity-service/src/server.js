

require ('dotenv').config();
const express = require('express');
const connectToDB = require('./config/db');
const logger = require('./utils/logger');
const helmet = require('helmet');
const cors = require('cors');
const redisClient = require('./config/redis'); // check while testing if this is required or not in server.js ?
const routes = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');
const globalredisRateLimiterMiddleware = require('./middleware/global-redis-rate-limiter');



// Create Express App
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectToDB();


// Importing Redis client from config folder redis.js (already connects to Redis automatically)



// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());


// Logging the http requests method and url
app.use((req,res,next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body: ${req.body}`);
    next();
});


app.use(globalredisRateLimiterMiddleware);



app.use('/api/auth', routes);



app.use(errorHandler);


// Start Server

app.listen(PORT, () => {
    logger.info(`Identity Service is running on PORT: ${PORT}`)
});





// process -> process is a global variable which holds information about the current node process.
// on -> on is a method of the process object which is used to listen for events.


// uncaughtException -> uncaughtException is an event emitted when an unexpected synchronous error occurs.
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});


// unhandledRejection -> unhandledRejection is an event emitted when a promise is rejected and there is no error handler to catch the rejection.
process.on('unhandledRejection', (error) => {
    logger.error('Uncaught Rejection:', error);
    process.exit(1);
});