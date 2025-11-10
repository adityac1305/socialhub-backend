
require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const redisClient = require('./config/redis');
const helmet = require('helmet');


const app = express();
const PORT = process.env.PORT || 3000;


// Redis



// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());


