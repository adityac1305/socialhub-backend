
const logger = require("../utils/logger");
const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];

    // We are spliting the auth header to get the token eg - "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    // authHeader.split produces an array ["Bearer", "eyJhbGciOiJIUzI1NiIsInR5cCI6..."]
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        logger.warn('Access attempt without token');
        return res.status(401).json({
            success : false,
            message : 'Access attempt without token'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            logger.warn('Invalid token');
            return res.status(403).json({
                success : false,
                message : 'Invalid token'
            });
        }
        req.user = user;
        next();
    });
};



module.exports = validateToken;