import { env } from "@/app/config/env";

export interface ApiErrorDetails {
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: ApiErrorDetails
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export type GetToken = () => string | null;

let getToken: GetToken = () => null;

export function setAuthTokenGetter(fn: GetToken) {
  getToken = fn;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function getJsonBody(body: unknown): Promise<string | undefined> {
  if (body === undefined || body === null) return undefined;
  return JSON.stringify(body);
}

function getHeaders(customHeaders?: HeadersInit): Headers {
  const headers = new Headers(customHeaders);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, ...init } = options;
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: getHeaders(init.headers),
    body: await getJsonBody(body),
  });

  if (!response.ok) {
    let message = response.statusText;
    let details: ApiErrorDetails | undefined;
    const contentType = response.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      try {
        const data = (await response.json()) as { message?: string; details?: ApiErrorDetails };
        message = data.message ?? message;
        details = data.details;
      } catch {
        // use default message
      }
    }
    throw new ApiError(response.status, message, details);
  }

  const responseContentType = response.headers.get("Content-Type");
  if (responseContentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return undefined as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
