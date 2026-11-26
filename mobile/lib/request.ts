import toast from "react-hot-toast";

const NON_REFRESHABLE_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/logout-all",
  "/auth/password/forgot",
  "/auth/password/reset",
];

type RefreshResult =
  | "success"
  | "unauthorized"
  | "serveWentDown"
  | "ratelimiting"
  | "failed";

let refreshPromise: Promise<RefreshResult> | null = null;

function isNonRefreshable(endpoint: string): boolean {
  const path = endpoint.split("?")[0].replace(/\/+$/, "").toLowerCase();

  return NON_REFRESHABLE_ENDPOINTS.some((item) => path.endsWith(item));
}

function isStreamBody(body: BodyInit | null | undefined): boolean {
  return (
    typeof ReadableStream !== "undefined" && body instanceof ReadableStream
  );
}

async function performRefresh(baseUrl: string): Promise<RefreshResult> {
  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) return "success";
    if (response.status === 401) return "unauthorized";
    if (response.status === 500) return "serveWentDown";
    if (response.status === 429) return "ratelimiting";

    return "failed";
  } catch {
    return "serveWentDown";
  }
}

function refreshAccessToken(baseUrl: string): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = performRefresh(baseUrl).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const base = baseUrl.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;

  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(typeof FormData !== "undefined" && options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const sendRequest = () =>
    fetch(url, {
      ...options,
      headers,
      credentials: options.credentials ?? "include",
      cache: "no-store",
    });

  let response = await sendRequest();

  const isBrowser = typeof window !== "undefined";

  if (
    isBrowser &&
    response.status === 401 &&
    !isNonRefreshable(path) &&
    !isStreamBody(options.body)
  ) {
    // Concurrent requests share the same refresh operation.
    const result = await refreshAccessToken(base);

    if (result === "success") {
      // The browser sends the updated cookies automatically.
      response = await sendRequest();
    } else if (result === "serveWentDown") {
      toast.error("Server is currently down, please try again later.", {
        id: "server-down",
      });
      throw new Error("Server is currently down, please try again later.");
    } else if (result === "ratelimiting") {
      toast.error("Rate limit exceeded, please try again later.", {
        id: "rate-limit",
      });
      throw new Error("Rate limit exceeded, please try again later.");
    } else if (
      result === "unauthorized" &&
      typeof window !== "undefined" &&
      !["/login", "/register"].includes(
        window.location.pathname.replace(/\/+$/, "") || "/",
      )
    ) {
      window.location.assign("/login");
    }
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    data = { message: response.statusText || "Request failed" };
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
  }

  return data as T;
}
