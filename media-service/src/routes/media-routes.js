


const express = require('express');

const {uploadMedia} = require('../controllers/media-controller');
const {authenticateRequest} = require('../middleware/authMiddleware');
const {handleUploadError} = require('../middleware/multerMiddleware');



const router = express.Router();



router.use(authenticateRequest);

router.post('/upload-media', handleUploadError, uploadMedia);


module.exports = router;
