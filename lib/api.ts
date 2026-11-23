/**
 * Small API client shared by all pages and components.
 * Keeps every backend URL in one place (no hardcoded URLs anywhere else).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** localStorage key for our JWT (minted by POST /api/auth/token). */
export const AUTH_TOKEN_KEY = "mentor-lagbe_jwt";

/** Reads the stored JWT (null when unavailable, e.g. during SSR). */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Builds a full backend URL from a path like "/api/tuitions". */
export function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Copy .env.local.example to .env.local and set it.",
    );
  }
  return `${API_URL}${path}`;
}

/**
 * Asks the backend for a fresh JWT using the current BetterAuth session
 * cookie and stores it. Shared by the auth provider (right after sign-in)
 * and by `apiFetch` (when a stored token has expired). Returns null when
 * no session is available or storage is unavailable.
 *
 * The request goes to the same origin (`/api/auth/token`) and is proxied to
 * the backend by `app/api/auth/[[...path]]/route.ts`, so it carries the
 * same-origin session cookie.
 */
let mintInFlight: Promise<string | null> | null = null;

export function mintAuthToken(): Promise<string | null> {
  // De-dupe concurrent mints (several requests may hit 401 at once).
  // The promise is reset after settlement so a later 401 or a new
  // session can trigger a fresh mint instead of returning a stale result.
  if (!mintInFlight) {
    mintInFlight = (async () => {
      const maxRetries = 3;
      const retryDelay = 200; // ms

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch("/api/auth/token", {
            method: "POST",
            credentials: "include",
          });
          if (!response.ok) {
            if (attempt < maxRetries - 1) {
              await new Promise((r) => setTimeout(r, retryDelay));
              continue;
            }
            return null;
          }

          const data = (await response.json().catch(() => null)) as { token?: unknown };
          if (typeof data?.token !== "string" || !data.token) {
            if (attempt < maxRetries - 1) {
              await new Promise((r) => setTimeout(r, retryDelay));
              continue;
            }
            return null;
          }

          try {
            window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          } catch {
            // Storage may be unavailable (private mode) — token still works in memory.
          }
          return data.token;
        } catch {
          if (attempt < maxRetries - 1) {
            await new Promise((r) => setTimeout(r, retryDelay));
            continue;
          }
          return null;
        }
      }
      return null;
    })().finally(() => {
      mintInFlight = null;
    });
  }
  return mintInFlight;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Plain object — serialized to JSON automatically. FormData is sent as-is. */
  body?: unknown;
  /** Optional JWT sent as `Authorization: Bearer <token>`. */
  token?: string;
}

/** Error thrown by `apiFetch`; carries the HTTP status for callers that care. */
export interface ApiError extends Error {
  status?: number;
}

/**
 * Fetches a backend endpoint and throws a readable error on failure.
 * Every CRUD action in the UI uses this helper, so error handling is
 * consistent across the app — and every protected request automatically
 * carries `Authorization: Bearer <JWT>`.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const doFetch = async (authToken: string | null): Promise<Response> =>
    fetch(getApiUrl(path), {
      ...rest,
      headers: {
        ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });

  // Use the caller's token, otherwise the stored JWT (sent automatically
  // on every protected request).
  let response = await doFetch(token ?? getStoredToken());

  // The stored JWT expires (7d) while the BetterAuth session may still be
  // valid — refresh it once and retry instead of failing the request.
  if (response.status === 401 && token === undefined && typeof window !== "undefined") {
    const storedBeforeMint = getStoredToken();
    const fresh = await mintAuthToken();
    if (fresh && fresh !== storedBeforeMint) {
      response = await doFetch(fresh);
    }
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    const error: ApiError = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data as T;
}
