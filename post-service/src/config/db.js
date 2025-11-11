
const logger = require('../utils/logger');
const mongoose = require('mongoose');


const connectToDB = async () => {
    try{

        await mongoose.connect(process.env.MONGODB_URI)
        logger.info('MongoDB Database connected successfully');

    }catch(error){
        logger.error(error);
        process.exit(1);
    }
};

module.exports = connectToDB;