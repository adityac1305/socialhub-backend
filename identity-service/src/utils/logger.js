/*
    Winston is a logging library for Node.js used to manage logs (info, error, debug, etc.).

    level - Sets the logging level to info for production and debug for development

    formats
    1. timestamp -  adds a timestamp to each log line.
    2. errors -  adds the error stack to each log line.
    3. splat -  Allows string interpolation in the log format.
             splat() is a Winston format helper that enables string interpolation, just like console.log() in Node.js or printf() in other languages. 
             Without splat(), Winston wouldn’t automatically replace placeholders like %s, %d, or %j inside your log messages.
    4. json -  stores logs in structured JSON format (useful for production log processors like Splunk, ELK, etc.)

*/

const winston = require('winston');

const logger = winston.createLogger({
    level : process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    

    // Adds a service name tag to each log entry
    defaultMeta : { service : 'identity-service' },
    


    // Transports define where the logs are stored/sent

    transports : [
        
        // - Write all logs to console
        new winston.transports.Console({
            format : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),

        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        new winston.transports.File({ filename: 'error.log', level: 'error' }),


        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        new winston.transports.File({ filename: 'combined.log' })

    ]
});


module.exports = logger;