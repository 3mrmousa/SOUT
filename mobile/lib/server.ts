import { cookies } from "next/headers";
import { request } from "./request";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/+$/, "")}/api`;

export async function server<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Cookie", (await cookies()).toString());

  return request<T>(API_URL, endpoint, {
    ...options,
    headers,
  });
}

export const serverRequest = server;
