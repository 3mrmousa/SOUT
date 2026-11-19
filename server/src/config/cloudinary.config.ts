import { v2 as cloudinary } from "cloudinary";

const isTest = process.env.NODE_ENV === "test";

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!isTest && (!cloud_name || !api_key || !api_secret)) {
  throw new Error("Missing Cloudinary environment variables");
}

if (cloud_name && api_key && api_secret) {
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
}

export default cloudinary;
