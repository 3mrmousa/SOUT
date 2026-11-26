import multer from "multer";
import AppError from "../utils/errors/AppError.js";

const storage = multer.memoryStorage();

const PROFILE_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const CHAT_MEDIA_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Audio & Voice Notes
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
  // Documents (PDF & Word)
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const uploadProfileImages = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (PROFILE_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid profile file type", 400));
    }
  },
});

export const uploadChatMedia = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB per file
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const baseMime = file.mimetype.split(";")[0] || file.mimetype;
    if (CHAT_MEDIA_TYPES.includes(baseMime)) cb(null, true);
    else cb(new AppError("Unsupported file type", 400));
  },
});
