import { authStore } from "../auth-store";
import { ApiError } from "./types";

export const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:4000/api/v1";

export const USE_MOCKS =
  ((import.meta.env.VITE_USE_MOCKS as string | undefined) ?? "true") !==
  "false";

export function mockDelay(ms = 450): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
  raw?: boolean;
}

/** Cookie-based: sends httpOnly auth cookies via credentials:"include". No bearer token. */
export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, raw } = opts;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    authStore.clear();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/signup")
    ) {
      window.location.replace("/login");
    }
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let data: unknown = undefined;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    // Backend shape: { error: { code, message, details } }
    let msg = res.statusText || "Request failed";
    const errObj =
      data && typeof data === "object" && "error" in data
        ? (data as { error: unknown }).error
        : data;
    if (errObj && typeof errObj === "object" && "message" in errObj) {
      msg = String((errObj as { message: unknown }).message);
    }
    throw new ApiError(res.status, msg, data);
  }

  if (raw) return res as unknown as T;
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
