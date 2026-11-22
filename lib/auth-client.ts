/**
 * BetterAuth React client.
 *
 * Talks to the BetterAuth endpoints mounted on the Express backend
 * (`/api/auth/*`). Session cookies are handled by the library;
 * our own JWT for API calls is minted separately in the AuthProvider.
 */
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_URL. Copy .env.local.example to .env.local and set it.",
  );
}

export const authClient = createAuthClient({
  baseURL,
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
