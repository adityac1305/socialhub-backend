

const {uploadMediaToCloudinary} = require('../utils/cloudinary');
const Media = require('../models/Media');
const logger = require('../utils/logger');



const uploadMedia = async (req, res) => {
    logger.info('uploadMedia');
    try{
        logger.info('File details from req.file',req.file);
        if(!req.file){
            logger.error('No file uploaded. Please upload a file.');
            return res.status(400).json({
                success : false,
                message : 'No file uploaded'
            });
        }

        const {originalname, mimetype, buffer} = req.file;
        
        // coming from authMiddleware.js
        const userId = req.user.userId

        logger.info(`File details: name: ${originalname}, type: ${mimetype}`);
        logger.info(`Uploading to Cloudinary starting...`);

        const cloudinaryUploadResult  = await uploadMediaToCloudinary(req.file);
        logger.info(`Cloudinary upload result: ${cloudinaryUploadResult}`);

        const newlyCreatedMedia = new Media ({
            publicId : cloudinaryUploadResult.public_id,
            originalName : originalname,
            mimeType : mimetype,
            url : cloudinaryUploadResult.secure_url,
            userId : userId
        });

        await newlyCreatedMedia.save();

        res.status(201).json({
            success : true,
            message : 'Media uploaded successfully',
            data : newlyCreatedMedia
        });

    }catch(error){
        logger.error('Error creating media',error);
        res.status(500).json({
            success : false,
            message : 'Error creating media',
        });
    }
};


const getAllMedia = async (req, res) => {
    logger.info('getAllMedia');
    try{
        const results = await Media.find({});
        res.status(200).json({
            success : true,
            message : 'Media fetched successfully',
            data : results
        });
    }catch(error){
        logger.error('Error fetching all media',error);
        res.status(500).json({
            success : false,
            message : 'Error fetching all media',
        });
    }
}


module.exports = {
    uploadMedia,
    getAllMedia
};