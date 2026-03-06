// Amazon S3 Service - File Upload/Download
import { 
  S3Client, 
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_REGION, S3_BUCKETS } from './aws-config';

const s3Client = new S3Client({ region: AWS_REGION });

export interface UploadRequest {
  file: File;
  key: string;
  bucket?: string;
}

export interface UploadResponse {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

// Upload file to S3
export const uploadToS3 = async (
  file: File,
  key: string,
  bucket: string = S3_BUCKETS.audioUploads
): Promise<string | null> => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return S3 URI
    return `s3://${bucket}/${key}`;
  } catch (error: any) {
    console.error('S3 upload error:', error);
    return null;
  }
};

// Upload with progress tracking
export const uploadFileWithProgress = async (
  file: File,
  key: string,
  onProgress?: (progress: number) => void,
  bucket: string = S3_BUCKETS.userContent
): Promise<UploadResponse> => {
  try {
    // For small files, upload directly
    if (file.size < 5 * 1024 * 1024) { // < 5MB
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: file.type,
      });

      await s3Client.send(command);

      if (onProgress) onProgress(100);

      return {
        success: true,
        key,
        url: `https://${bucket}.s3.${AWS_REGION}.amazonaws.com/${key}`,
      };
    }

    // For larger files, use multipart upload (future enhancement)
    throw new Error('Large file upload not yet implemented');
  } catch (error: any) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Get pre-signed URL for download
export const getDownloadUrl = async (
  key: string,
  bucket: string = S3_BUCKETS.userContent,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error: any) {
    console.error('S3 get URL error:', error);
    return null;
  }
};

// Get pre-signed URL for upload (client-side upload)
export const getUploadUrl = async (
  key: string,
  bucket: string = S3_BUCKETS.userContent,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error: any) {
    console.error('S3 get upload URL error:', error);
    return null;
  }
};

// Delete file from S3
export const deleteFromS3 = async (
  key: string,
  bucket: string = S3_BUCKETS.userContent
): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    console.error('S3 delete error:', error);
    return false;
  }
};

// Upload audio file
export const uploadAudioFile = async (
  audioFile: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const key = `audio/${userId}/${Date.now()}-${audioFile.name}`;
  return uploadFileWithProgress(audioFile, key, onProgress, S3_BUCKETS.audioUploads);
};

// Upload user profile picture
export const uploadProfilePicture = async (
  imageFile: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const key = `profiles/${userId}/avatar.${imageFile.name.split('.').pop()}`;
  return uploadFileWithProgress(imageFile, key, onProgress, S3_BUCKETS.userContent);
};
