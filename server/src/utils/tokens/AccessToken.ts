import type { Response } from "express";
import jwt from "jsonwebtoken";

export const generateAndSetJWT = (
  userId: string,
  username: string,
  res: Response,
) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT Secret is not defined");
  }

  const token = jwt.sign({ userId, username }, secret, {
    expiresIn: "15m",
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  return token;
};

export const removeJWT = (res: Response) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

export default generateAndSetJWT;
