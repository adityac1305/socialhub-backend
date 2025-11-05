

const express = require('express');
const { registerUser } = require('../controllers/identity-controller');
const sensitveEndpointRateLimiter = require('../middleware/sensitive-endpoint-rate-limiter');


const router = express.Router();



// Middleware




// Routes
router.post('/register', sensitveEndpointRateLimiter, registerUser);




module.exports = router;

