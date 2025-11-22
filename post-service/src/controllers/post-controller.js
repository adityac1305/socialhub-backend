

const Post = require('../models/Post');
const logger = require('../utils/logger');
const { validateCreatePost } = require('../utils/validation');
const redisClient = require('../config/redis');
const {publishEvent} = require('../utils/rabbitmq');


// Invalidate Redis Cache

async function invalidatePostCache(req, input){

    // Deletes the single post from the cache 
    const cacheKey = `post:${input}`;
    await req.redisClient.del(cacheKey);


    // Deletes all the posts from the cache
    
    // Fetches the keys which have the prefix "posts:*"
    const keys = await req.redisClient.keys("posts:*");

    // Deletes the keys if keys exists
    if(keys.length > 0){
        await req.redisClient.del(keys);
    }
}




// Create a new post
const createPost = async (req, res) => {
    
    logger.info('Create Post endpoint hit');
    
    try {

        // Validating user input
        const { error } = validateCreatePost(req.body);
        if (error) {
            logger.warn('Validation error', error.details[0].message);
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            });
        }
        
        // Assigning user input to variables
        const {content, mediaIds} = req.body;

        // Creating a new post
        const newlyCreatedPost = await Post.create({
            user : req.user.userId,
            content,
            mediaIds : mediaIds || [],
        });

        // Saving the newly created post to MongoDB
        await newlyCreatedPost.save();



        // Publish post.created event to RabbitMQ
        await publishEvent('post.created', {
            postId : newlyCreatedPost._id.toString(),
            userId : newlyCreatedPost.user.toString(),
            content : newlyCreatedPost.content,
            createdAt : newlyCreatedPost.createdAt,
        });




        // Invalidate Redis Cache
        // We need to invalidate the cache when a new post is created/updated/deleted because new post creation/update/deletion is not reflected in the get all posts cache.
        // Without invalidation, getAllPosts could return stale posts to users.
        await invalidatePostCache(req, newlyCreatedPost._id.toString());


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

const getAllPosts = async (req, res) => {``
    try {

        // Pagination
        // Reads pagination parameters from the query string (?page=2&limit=10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        
        // Create a cache key using page and limit.
        // The cache key is used to store and retrieve the posts from the cache.
        const cacheKey = `posts:${page}:${limit}`;

        // Check if the posts are already cached
        const cachedPosts = await redisClient.get(cacheKey);

        // If the posts are cached, return them [in case of cache hit]
        if(cachedPosts){
            logger.info('Fetching posts from cache');
            return res.json(JSON.parse(cachedPosts));
        }

        // If the posts are not cached, fetch them from the database [in case of cache miss]
        const posts = await Post.find({}).sort({createdAt : -1}).skip(startIndex).limit(limit);


        // Get the total number of posts to compute the total number of pages
        const totalNoOfPosts = await Post.countDocuments();

        // Create the result object
        const result = {
            posts,
            currentPage : page,
            totalPages : Math.ceil(totalNoOfPosts / limit),
            totalPosts : totalNoOfPosts
        };

        // Save your posts in redis cache
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));


        // Return the posts and pagination metadata
        res.json(result);

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
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;

        // Check if the post is already cached
        const cachedPost = await req.redisClient.get(cacheKey);

        // If the post is cached, return it [in case of cache hit]
        if(cachedPost){
            return res.json(JSON.parse(cachedPost));
        }

        // If the post is not cached, fetch it from the database [in case of cache miss]
        const singlePostById = await Post.findById(postId);

        // Check if the post exists
        if(!singlePostById){
            return res.status(404).json({
                success : false,
                message : 'Post not found'
            });
        }

        // Save your post in redis cache
        await req.redisClient.setex(cacheKey, 300, JSON.stringify(singlePostById));

        // Return the post
        res.json(singlePostById);

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
        
        // Fetches and deletes the post from the MongoDB database with post ID and user ID
        // Prevents Unauthorized Deletions of other user's posts
        const post = await Post.findOneAndDelete({
            _id : req.params.id,
            user : req.user.userId
        });

        // Check if the post exists
        if(!post){
            return res.status(404).json({
                success : false,
                message : 'Post not found'
            });
        }


        // Publish the event to RabbitMQ
        await publishEvent('post.deleted', {
            postId : post._id.toString(),
            userId : req.user.userId,
            mediaIds : post.mediaIds
        });



        // Remove the post from the cache
        await invalidatePostCache(req, req.params.id);
        res.json({
            success : true,
            message : 'Post Deleted Successfully'
        })


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