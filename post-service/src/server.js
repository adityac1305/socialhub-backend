
require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const connectToDB = require('./config/db');
const redisClient = require('./config/redis');
const postRoutes = require('./routes/post-routes');
const errorHandler = require('./middleware/errorHandler');
const {connectToRabbitMQ, publishEvent} = require('./utils/rabbitmq');



const app = express();
const PORT = process.env.PORT || 3002;


// Importing Redis client from config folder redis.js (already connects to Redis automatically)

// Database connection
connectToDB();


// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});



// *** HW Implement global rate limiting *** //
// *** HW Implement IP Based rate limiting for sensitive endpoint *** //


// Routes
// We are also passing redis client as we want to use it in the controllers
app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, postRoutes);



// Error Handler
app.use(errorHandler);



async function startServer() {
    try {
        
        // Connect to RabbitMQ
        await connectToRabbitMQ();


        // Start the server
        app.listen(PORT, () => {
            logger.info(`Post Service is running on port ${PORT}`);
        });

    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
}

startServer();






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