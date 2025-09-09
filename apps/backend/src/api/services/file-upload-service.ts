import {
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import multer from "multer"

import appConfig from "../../config/appConfig"
import { logger } from "../../utils/winstonLogger"

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  ...(appConfig.environment === "development" && {
    endpoint: "http://localhost:9000",
    forcePathStyle: true,
  }),
})

interface File {
  buffer: Buffer
  name: string
  mimetype: string
}

const storage = multer.memoryStorage()

export const FileUploadService = {
  multerUpload: multer({ storage }),
  /**
   * ✅ Upload a file to S3
   */
  uploadToS3: async (file: File) => {
    try {
      if (!file || !file.buffer || !file.name) {
        throw new Error("Invalid file input")
      }

      const bucketName = process.env.S3_BUCKET

      if (!bucketName) {
        throw new Error("S3_BUCKET environment variable is not defined")
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: file.name,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: ObjectCannedACL.private,
          ContentDisposition: "inline",
        }),
      )

      logger.info(`✅ File uploaded to S3: ${file.name}`)

      return {
        success: true,
        key: file.name,
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      logger.error(`❌ Error uploading file to S3: ${errorMessage}`)
      throw new Error("File upload failed")
    }
  },

  /**
   * ✅ Delete a file from S3
   * @param fileKey - S3 key of the file to delete
   * @returns Result of file deletion
   */
  deleteFromS3: async (fileKey: string) => {
    try {
      if (!fileKey) {
        throw new Error("File key is required for deletion")
      }

      const bucketName = process.env.S3_BUCKET

      if (!bucketName) {
        throw new Error("S3_BUCKET environment variable is not defined")
      }

      const deleteParams = {
        Bucket: bucketName,
        Key: fileKey,
      }

      await s3.send(new DeleteObjectCommand(deleteParams))

      logger.info(`✅ File deleted from S3: ${fileKey}`)

      return { success: true, message: "File deleted successfully" }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      logger.error(`❌ Error deleting file from S3: ${errorMessage}`)
      throw new Error("File deletion failed")
    }
  },

  /**
   * ✅ Generate a signed URL for accessing files securely
   * @param fileKey - S3 key of the file
   * @param expires - Expiration time for the signed URL in seconds
   * @returns Signed URL
   */
  generateSignedUrl: async (
    fileKey: string,
    expires: number = 60 * 60, // 1 hour
  ) => {
    try {
      if (!fileKey) {
        throw new Error("File key is required to generate a signed URL")
      }

      const bucketName = process.env.S3_BUCKET

      if (!bucketName) {
        throw new Error("S3_BUCKET environment variable is not defined")
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      })

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: expires })

      logger.info(`✅ Signed URL generated for file: ${fileKey}`)

      return signedUrl
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      logger.error(`❌ Error generating signed URL for file: ${errorMessage}`)
      throw new Error("Failed to generate signed URL")
    }
  },
}
