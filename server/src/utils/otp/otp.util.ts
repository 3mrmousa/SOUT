import { randomInt, createHash } from "node:crypto";

export const generateOTP = (): string => {
  return randomInt(100000, 1000000).toString();
};

export const hashOTP = (otp: string): string => {
  return createHash("sha256").update(otp).digest("hex");
};

export const verifyOTP = (otp: string, hashedOtp: string): boolean => {
  return hashOTP(otp) === hashedOtp;
};
