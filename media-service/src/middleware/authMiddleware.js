


const logger = require('../utils/logger');


const authenticateRequest = (req, res, next) => {
        const userId = req.headers['x-user-id'];

        if(!userId){
            logger.warn(`Access attempt without user ID`);
            return res.status(401).json({
                success : false,
                message : 'Access attempt without user ID'
            });
        }

        req.user = {userId};
        next();
    };

    
module.exports = {
    authenticateRequest
};