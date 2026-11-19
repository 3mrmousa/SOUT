import type { NextFunction, Response } from "express";
import type { AuthRequest, JWTPayload } from "../types/types";
import asyncHandler from "../utils/errors/asyncHandler";
import AppError from "../utils/errors/AppError";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = req.cookies?.access_token || req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError(
        "You are not logged in! Please log in to get access.",
        401,
      );
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined!");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    const user = await db.orm.public.User.first({
      id: decoded.userId,
      username: decoded.username,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password: _password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  },
);
