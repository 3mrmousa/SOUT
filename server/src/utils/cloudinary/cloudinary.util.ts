import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary from "../../config/cloudinary.config.js";
import streamifier from "streamifier";
import AppError from "../errors/AppError.js";
import type { ProfileImageJson } from "../../types/types.js";

export const uploadPFPToCloudinary = (
  fileBuffer: Buffer,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "SOUT/ProfilePictures",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error || !result) {
          return reject(error || new AppError("Failed to upload image", 500));
        }
        resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (_error) {
    throw new AppError("Cloudinary delete failed", 500);
  }
};

export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
): Promise<ProfileImageJson> => {
  const result = await uploadPFPToCloudinary(fileBuffer);
  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
};

export default {
  uploadPFPToCloudinary,
  deleteFromCloudinary,
  uploadImageToCloudinary,
};
