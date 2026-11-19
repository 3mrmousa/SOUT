import type { Request } from "express";
import type { db } from "../prisma/db";

export type User = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.User.first>>
>;

export type SafeUser = Omit<User, "password">;

export interface JWTPayload {
  userId: string;
  username: string;
}

export interface AuthRequest extends Request {
  user: SafeUser;
}

export type ProfileImageJson = {
  secure_url: string;
  public_id: string;
  [key: string]: string;
};

export interface RefreshTokenResponseData {
  user: SafeUser;
}
