

require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const express = require('express');
const connectToDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const {connectToRabbitMQ, consumeEvent} = require('./utils/rabbitmq');
const redisClient = require('./config/redis');
const searchRoutes = require('./routes/search-routes'); 
const {handlePostCreatedEvent, handlePostDeletedEvent} = require('./eventHandlers/search-event-handlers');

const app = express();
const PORT = process.env.PORT || 3004;


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



//*** Homework - implement Ip based rate limiting for sensitive endpoints

//*** Homework - pass redis client as part of your req and then implement redis caching


app.use('/api/search', searchRoutes);


app.use(errorHandler);

async function startServer() {
    try {
        
        // Connect to RabbitMQ
        await connectToRabbitMQ();


        // Consume the event with routing key as post.deleted and callback as handlePostDeletedEvent
        await consumeEvent('post.created', handlePostCreatedEvent);
        await consumeEvent('post.deleted', handlePostDeletedEvent);


        // Start the server
        app.listen(PORT, () => {
            logger.info(`Search Service is running on port ${PORT}`);
            logger.info(` Redis URL ${process.env.REDIS_URL}`);
        });


    }catch(error) {

        logger.error('Failed to start the search service', error);
        process.exit(1);
    }
}

startServer();