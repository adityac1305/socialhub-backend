
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


/*
1. Why we use a Promise instead of async/await directly?

Cloudinary’s upload_stream() uses callbacks, not Promises.
Async/await only works with Promises.
So we wrap the callback inside a Promise to make it awaitable.
This will allow us to do const result = await uploadMediaToCloudinary(file);

Now the upload() method allows us to use async/await.
then Why use upload_stream instead of upload

 - upload() loads the entire file into memory first
 - It expects a file path, URL, or Base64 string
 - If you give it a buffer, Node must load the entire file into RAM
 - Bad for large files (videos, PDFs, high-res images)
 - Bad under high concurrency



upload_stream() uploads in small chunks

 - Processes the file as a stream
 - Does NOT load the whole file into memory
 - Much safer for:
 - Large files
 - High-traffic production APIs
 - Mobile uploads
 - Multiple parallel uploads

*/


const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                // Cloudinary detects image/video/audio/pdf etc automatically
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    logger.error("Error While Uploading Media To Cloudinary",error);
                    reject(error);
                }
                else{
                    resolve(result);
                }
            }
        );

        // Send this file data through the pipe to Cloudinary, and then close the pipe.
        uploadStream.end(file.buffer);
        
    });
};





module.exports = uploadMediaToCloudinary;