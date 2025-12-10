

const Post = require('../models/Post');
const logger = require('../utils/logger');
const { validateCreatePost } = require('../utils/validation');


// Create a new post
const createPost = async (req, res) => {
    
    logger.info('Create Post endpoint hit');
    
    try {
        const { error } = validateCreatePost(req.body);
        if (error) {
            logger.warn('Validation error', error.details[0].message);
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            });
        }
              
        const {content, mediaIds} = req.body;

        const newlyCreatedPost = await Post.create({
            user : req.user.userId,
            content,
            mediaIds : mediaIds || [],
        });

        await newlyCreatedPost.save();

        logger.info('Post Created Successfully', newlyCreatedPost);
        res.status(201).json({
            success : true,
            message : 'Post Created Successfully',
            data : newlyCreatedPost
        });

    } catch (error) {
        logger.error('Error Creating Post',error);
        res.status(500).json({
            success : false,
            message : 'Error Creating Post'
        });
    }
};



// Get All Posts

const getAllPosts = async (req, res) => {
    try {

    } catch (error) {
        logger.error('Error Fetching All Posts',error);
        res.status(500).json({
            success : false,
            message : 'Error Fetching All Posts'
        });
    }
};


// Get a Post

const getPost = async (req, res) => {
    try {

    } catch (error) {
        logger.error('Error Fetching Post',error);
        res.status(500).json({
            success : false,
            message : 'Error Fetching Post'
        });
    }
};



// Delete a Post

const deletePost = async (req, res) => {
    try {

    } catch (error) {
        logger.error('Error Deleting Post',error);
        res.status(500).json({
            success : false,
            message : 'Error Deleting Post'
        });
    }
};



module.exports = {
    createPost,
    getAllPosts,
    getPost,
    deletePost
};