import { S3Client } from "@aws-sdk/client-s3";

const isTest = process.env.NODE_ENV === "test";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(
  /\/+$/,
  "",
);

if (
  !isTest &&
  (!accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !R2_BUCKET_NAME ||
    !R2_PUBLIC_URL)
) {
  throw new Error("Missing Cloudflare R2 environment variables");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export default r2Client;
