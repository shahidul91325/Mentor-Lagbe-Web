/**
 * BetterAuth React client.
 *
 * Auth requests target our own origin (`/api/auth/*`). In production they
 * are proxied to the backend by `app/api/auth/[[...path]]/route.ts`, which
 * keeps the BetterAuth session cookie same-origin so browsers store and send
 * it across the separate frontend/backend Vercel hostnames. In local
 * development the proxy forwards to http://localhost:5000.
 *
 * Session cookies are handled by the library; our own JWT for API calls is
 * minted separately in the AuthProvider via `POST /api/auth/token` (also
 * proxied same-origin).
 */
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// Intentionally undefined: requests resolve to the current origin
// (`/api/auth/*`) and are proxied to the backend in production.
export const authClient = createAuthClient({
  baseURL: undefined,
  fetchOptions: {
    credentials: "include",
  },
  // Tells the client about the extra user fields the server accepts on
  // sign-up (role) and returns in the session — mirrors the server config.
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: true, input: true },
        plan: { type: "string", required: true, input: false },
        phone: { type: "string", required: false, input: true },
        bio: { type: "string", required: false, input: true },
      },
    }),
  ],
});

export type AuthError = { message?: string; code?: string; status?: number };
