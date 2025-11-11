
require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const connectToDB = require('./config/db');
const redisClient = require('./config/redis');
const {postRoutes} = require('./routes/post-routes');
const errorHandler = require('./middleware/errorHandler');



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



