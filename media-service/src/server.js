
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const connectToDB = require('./config/db');
const redisClient = require('./config/redis');
const mediaRoutes = require('./routes/media-routes');
const errorHandler = require('./middleware/errorHandler');
const {connectToRabbitMQ, publishEvent, consumeEvent} = require('./utils/rabbitmq');
const {handlePostDeletedEvent} = require('./eventHandlers/media-event-handlers');


const app = express();
const PORT = process.env.PORT || 3003;


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


//*** Homework Implement IP based global rate limiting and rate limiting for sensitive endpoints */



app.use('/api/media', mediaRoutes);


app.use(errorHandler);


async function startServer() {
    try {
        
        // Connect to RabbitMQ
        await connectToRabbitMQ();


        // Consume the event with routing key as post.deleted and callback as handlePostDeletedEvent
        await consumeEvent('post.deleted', handlePostDeletedEvent);


        // Start the server
        app.listen(PORT, () => {
            logger.info(`Media Service is running on port ${PORT}`);
            logger.info(` Redis URL ${process.env.REDIS_URL}`);
        });

    }catch(error) {
        logger.error(error);
        process.exit(1);
    }
};


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