import crypto from "node:crypto";
import type {
  ChatMediaItem,
  MediaCategory,
  ProfileImageJson,
} from "../../types/types";
import r2Client, {
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} from "../../config/r2.config";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import AppError from "../errors/AppError";

const PFP_MIME_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CHAT_MIME_MAP: Record<string, { ext: string; category: MediaCategory }> =
  {
    "image/jpeg": { ext: "jpg", category: "IMAGE" },
    "image/jpg": { ext: "jpg", category: "IMAGE" },
    "image/png": { ext: "png", category: "IMAGE" },
    "image/webp": { ext: "webp", category: "IMAGE" },
    "image/gif": { ext: "gif", category: "IMAGE" },
    "video/mp4": { ext: "mp4", category: "VIDEO" },
    "video/webm": { ext: "webm", category: "VIDEO" },
    "video/quicktime": { ext: "mov", category: "VIDEO" },
    "audio/mpeg": { ext: "mp3", category: "AUDIO" },
    "audio/mp3": { ext: "mp3", category: "AUDIO" },
    "audio/wav": { ext: "wav", category: "AUDIO" },
    "audio/ogg": { ext: "ogg", category: "AUDIO" },
    "audio/webm": { ext: "weba", category: "AUDIO" },
    "audio/mp4": { ext: "m4a", category: "AUDIO" },
    "audio/aac": { ext: "aac", category: "AUDIO" },
    "audio/x-m4a": { ext: "m4a", category: "AUDIO" },
    "application/pdf": { ext: "pdf", category: "DOCUMENT" },
    "application/msword": { ext: "doc", category: "DOCUMENT" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      ext: "docx",
      category: "DOCUMENT",
    },
  };

export const uploadProfileImageToR2 = async (
  fileBuffer: Buffer,
  mimeType: string,
  userId: string,
): Promise<ProfileImageJson> => {
  const ext = PFP_MIME_TYPE[mimeType] ?? "png";
  const key = `profiles/${userId}/${crypto.randomUUID()}.${ext}`;

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return {
      secure_url: `${R2_PUBLIC_URL}/${key}`,
      public_id: key,
    };
  } catch (_error) {
    throw new AppError("Failed to upload image to Cloudflare R2", 500);
  }
};

export const uploadMessageImageToR2 = async (
  file: Express.Multer.File,
  conversationId: string,
  userId: string,
): Promise<ChatMediaItem> => {
  const baseMime = file.mimetype.split(";")[0] || file.mimetype;
  const meta = CHAT_MIME_MAP[baseMime];

  if (!meta) {
    throw new AppError("Unsupported chat media type", 400);
  }

  const key = `chats/${conversationId}/${meta.category.toLowerCase()}/${userId}/${crypto.randomUUID()}.${meta.ext}`;

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: baseMime,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return {
      url: `${R2_PUBLIC_URL}/${key}`,
      key,
      fileName: file.originalname,
      mimeType: baseMime,
      size: file.size,
      category: meta.category,
    };
  } catch (_error) {
    throw new AppError("Failed to upload chat media to R2", 500);
  }
};

export const deleteFromR2 = async (key: string): Promise<void> => {
  if (!key) return;

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      }),
    );
  } catch (_error) {
    throw new AppError("Cloudflare R2 delete failed", 500);
  }
};
