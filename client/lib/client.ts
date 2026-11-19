import { request } from "./request";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/+$/, "")}/api`;

export function client<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return request<T>(API_URL, endpoint, {
    credentials: "include",
    ...options,
  });
}

export const clientRequest = client;
