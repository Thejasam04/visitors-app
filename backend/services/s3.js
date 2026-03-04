const AWS  = require('aws-sdk');
const uuid = require('uuid');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
  region          : process.env.AWS_REGION
});

// Upload base64 photo to S3
const uploadPhoto = async (base64Image) => {
  // Remove data:image/jpeg;base64, prefix
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer     = Buffer.from(base64Data, 'base64');

  const fileName = `visitors/${uuid.v4()}.jpg`;

  const params = {
    Bucket      : process.env.S3_BUCKET_NAME,
    Key         : fileName,
    Body        : buffer,
    ContentType : 'image/jpeg'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

module.exports = { uploadPhoto };