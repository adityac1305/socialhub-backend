

const Search = require('../models/Search');
const logger = require('../utils/logger');

async function handlePostCreatedEvent(event) {
    logger.info('Post created event received');
    try{
        const newSearchPost = new Search({
            postId : event.postId, 
            userId : event.userId,
            content : event.content,
            createdAt : event.createdAt
        });

        await newSearchPost.save();

        logger.info(`Search Post created: ${event.postId}, ${newSearchPost._id.toString()} `);


    }catch(error){
        logger.error(error);
        res.status(500).json({
            success : false, 
            message : 'Error Handling Post Created Event',
        });

    }
}




async function handlePostDeletedEvent(event) {
    logger.info('Post deleted event received');
    try{

        await Search.findOneAndDelete({postId : event.postId});

        logger.info(`Search Post deleted: ${event.postId} `);


    }catch(error){
        logger.error(error);
        res.status(500).json({
            success : false, 
            message : 'Error Handling Post Deleted Event',
        });

    }
}    

module.exports = {handlePostCreatedEvent, handlePostDeletedEvent};