import { authStore } from "../auth-store";
import { ApiError } from "./types";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";

export const USE_MOCKS =
  ((import.meta.env.VITE_USE_MOCKS as string | undefined) ?? "true") !== "false";

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

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, raw } = opts;
  const token = authStore.getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    authStore.clear();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
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
    let msg = res.statusText || "Request failed";
    if (data && typeof data === "object" && "message" in data) {
      msg = String((data as { message: unknown }).message);
    }
    throw new ApiError(res.status, msg, data);
  }

  if (raw) return res as unknown as T;
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
