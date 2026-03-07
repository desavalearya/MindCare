// Amazon S3 Service
// Handles file uploads and downloads

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { awsConfig } from '@/config/aws-config';

// Initialize S3 client
export const s3Client = new S3Client({
  region: awsConfig.s3.region,
});

/**
 * Upload file to S3
 */
export const uploadFileToS3 = async (
  file: File,
  key: string,
  bucket: string = awsConfig.s3.bucketName
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: file.type,
  });

  await s3Client.send(command);
  return `https://${bucket}.s3.${awsConfig.s3.region}.amazonaws.com/${key}`;
};

/**
 * Get presigned URL for file download
 */
export const getPresignedUrl = async (
  key: string,
  bucket: string = awsConfig.s3.bucketName,
  expiresIn: number = 3600
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Upload audio file to audio bucket
 */
export const uploadAudioFile = async (file: File, userId: string): Promise<string> => {
  const timestamp = Date.now();
  const key = `audio/${userId}/${timestamp}-${file.name}`;
  return await uploadFileToS3(file, key, awsConfig.s3.audioBucket);
};

export default s3Client;
