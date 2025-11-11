


const express = require('express');
const { createPost, getAllPosts, getPost, deletePost } = require('../controllers/post-controller');
const { authenticateRequest } = require('../middleware/authMiddleware');


const router = express.Router();

router.use(authenticateRequest);


router.post('/create-post', createPost);
router.get('/get-all-posts', getAllPosts);
router.get('/get-post/:id', getPost);
// router.put('/:id', updatePost);
router.delete('/delete-post/:id', deletePost);



module.exports = router;