import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import AppError from "../utils/errors/AppError.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.error && err.error.length > 0 ? { errors: err.error } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      status: "fail",
      message: err.message,
      code: err.code,
    });
    return;
  }

  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    res.status(401).json({
      status: "fail",
      message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
    return;
  }

  const statusCode =
    "statusCode" in err && typeof err.statusCode === "number"
      ? err.statusCode
      : 500;
  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message: err.message || "Internal server error",
  });
}
