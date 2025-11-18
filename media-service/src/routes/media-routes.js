


const express = require('express');

const {uploadMedia, getAllMedia} = require('../controllers/media-controller');
const {authenticateRequest} = require('../middleware/authMiddleware');
const {handleUploadError} = require('../middleware/multerMiddleware');



const router = express.Router();



router.use(authenticateRequest);

router.post('/upload-media', handleUploadError, uploadMedia);
router.get('/all-media', getAllMedia);


module.exports = router;
