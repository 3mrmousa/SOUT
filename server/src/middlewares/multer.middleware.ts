import multer from "multer";
import AppError from "../utils/errors/AppError.js";

const storage = multer.memoryStorage();

const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type", 400));
    }
  },
});

export default upload;
