

const Media = require('../models/Media');
const logger = require('../utils/logger');
const {deleteMediaFromCloudinary} = require('../utils/cloudinary');


const handlePostDeletedEvent = async (event) => {
    try{

        const {postId, userId, mediaIds} = event;

        logger.info(`postId: ${postId}, userId: ${userId}, mediaIds: ${mediaIds}`);


        // Finds all media documents whose publicId is in the array mediaIds.
        // $in is a MongoDB operator that matches any ID in the array.
        // Result: mediaToDelete is an array of media objects.
        const mediaToDelete = await Media.find({
            publicId : {$in : mediaIds}
        });


        // For each media item in the array:
        // Delete it from Cloudinary using its publicId.
        // Delete the corresponding document from MongoDB.
        for (const media of mediaToDelete) {

            await deleteMediaFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);

            logger.info(`Deleted Media ${media._id} associated with deleted post ${postId}`);

        }

        logger.info(`Processed deletion of media for post id ${postId}`);

    }catch(error){
        logger.error('Error occurred while media deletion',error);
    }
};


module.exports = {
    handlePostDeletedEvent
};