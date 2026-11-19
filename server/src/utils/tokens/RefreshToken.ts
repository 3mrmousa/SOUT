import { randomBytes, createHash } from "node:crypto";
import type { Response } from "express";

export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface GeneratedRefreshToken {
  token: string;
  tokenHash: string;
  expiresAt: string;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken() {
  const token = randomBytes(40).toString("hex");
  const hashedToken = hashToken(token);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return { token, hashedToken, expiresAt };
}

export function setRefreshToken(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export const removeRefreshToken = (res: Response) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};
