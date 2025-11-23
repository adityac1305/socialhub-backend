

const express = require('express');
const { registerUser, loginUser, refreshTokenUser, logoutUser } = require('../controllers/identity-controller');
const sensitveEndpointRateLimiter = require('../middleware/sensitive-endpoint-rate-limiter');


const router = express.Router();



// Middleware




// Routes
router.post('/register', sensitveEndpointRateLimiter, registerUser);
router.post('/login', sensitveEndpointRateLimiter, loginUser);
router.post('/refresh-token', refreshTokenUser);
router.post('/logout', logoutUser);



module.exports = router;

