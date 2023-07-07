const AWS = require('aws-sdk');
const fs = require('fs');

// Config
const config = require('../../../../app/config');

// UPLOAD Base
const uploadBase = process.cwd() + '/public/uploads/'

// The name of the bucket that you have created
const BUCKET_NAME = config.aws.bucketName;

// Connection For Aws
const s3 = new AWS.S3({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
});

const uploadAws = async (filePath, contentType) => {

    let uploadStatus = false

    // Read content from the file
    const fileContent = await fs.readFileSync(uploadBase + filePath);

    // Setting up S3 upload parameters
    const params = {
        ACL: 'public-read',
        Bucket: BUCKET_NAME,
        Key: filePath, // File name you want to save as in S3
        Body: fileContent,
        ContentType: contentType
    };

    // Uploading files to the bucket
    try {

        const uploadAws = await s3.upload(params).promise();
        fs.unlinkSync(uploadBase + filePath);
        
        return {
            status: true,
            uploadAws
        }

    } catch (error) {
        return {
            status: false,
            msg: error
        };   
    }
}

module.exports = {
    uploadAws
}