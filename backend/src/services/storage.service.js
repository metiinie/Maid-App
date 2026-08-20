const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'mock_aws_access_key') {
    s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
}

async function uploadFile({ buffer, mimetype, folder = 'general', filename = null }) {
    const ext = mimetype.split('/')[1] || 'bin';
    const fileKey = `${folder}/${filename || uuidv4()}.${ext}`;

    if (s3Client) {
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey,
            Body: buffer,
            ContentType: mimetype
        }));
        return `${process.env.AWS_CLOUDFRONT_URL}/${fileKey}`;
    } else {
        console.log(`[MOCK S3 UPLOAD] Bucket: ${process.env.AWS_S3_BUCKET} | Key: ${fileKey}`);
        return `${process.env.AWS_CLOUDFRONT_URL || 'https://cdn.ethiorecruit.com'}/${fileKey}`;
    }
}

async function deleteFile(cloudFrontUrl) {
    if (!cloudFrontUrl) return;
    const baseUrl = process.env.AWS_CLOUDFRONT_URL || 'https://cdn.ethiorecruit.com';
    const key = cloudFrontUrl.replace(`${baseUrl}/`, '');

    if (s3Client) {
        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        }));
        console.log(`🗑️ S3 File deleted: ${key}`);
    } else {
        console.log(`[MOCK S3 DELETE] Key: ${key}`);
    }
}

module.exports = { uploadFile, deleteFile };
