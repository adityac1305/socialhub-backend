
// Importing the winston logger from the utils folder which allows us to log erros in structured and consistent format.

const logger = require('../utils/logger');


// In Express any middleware with four arguments is an error handler.
// It catches all errors that occur in routes, controllers or other middleware when we call next(err) or when an exception is thrown.

const errorHandler = (err, req, res, next) => {
    
    
    // This sends the error stack to winston logger.
    logger.error(err.stack);

    // Sending clean JSON response to the client
    res.status(err.status || 500).json({
        message : err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;