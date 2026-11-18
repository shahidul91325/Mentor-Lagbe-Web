/**
 * Small API client shared by all pages and components.
 * Keeps every backend URL in one place (no hardcoded URLs anywhere else).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Builds a full backend URL from a path like "/api/tuitions". */
export function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Copy .env.local.example to .env.local and set it.",
    );
  }
  return `${API_URL}${path}`;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Plain object — serialized to JSON automatically. FormData is sent as-is. */
  body?: unknown;
  /** Optional JWT sent as `Authorization: Bearer <token>`. */
  token?: string;
}

/**
 * Fetches a backend endpoint and throws a readable error on failure.
 * Every CRUD action in the UI uses this helper, so error handling is
 * consistent across the app.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(getApiUrl(path), {
    ...rest,
    headers: {
      ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
