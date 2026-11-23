import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin proxy for BetterAuth endpoints.
 *
 * The frontend (https://mentor-lagbe-web.vercel.app) and the backend
 * (https://mentor-lagbe-web-server.vercel.app) live on separate hostnames,
 * so cookies are cross-site there. By proxying /api/auth/* through the
 * frontend's own origin, the BetterAuth session cookie becomes same-origin
 * and browsers reliably store and send it. Local development also works via
 * this proxy (it forwards to http://localhost:5000).
 *
 * Only /api/auth/* (including /api/auth/token) is proxied; every other
 * backend API is called directly by lib/api.ts.
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_URL. Copy .env.local.example to .env.local and set it.",
  );
}

/** Headers that must never be forwarded to the backend. */
const SKIPPED_HEADERS = new Set(["host", "content-length", "connection", "transfer-encoding"]);

async function resolvePath(params: unknown): Promise<string[]> {
  let resolved = params;
  // Next.js route handlers receive (request, { params }) where `params` is a Promise.
  if (resolved && typeof resolved === "object" && "params" in resolved) {
    resolved = (resolved as { params: unknown }).params;
  }
  if (resolved && typeof resolved === "object" && "then" in resolved) {
    resolved = await resolved;
  }
  let path = (resolved as { path?: unknown })?.path;
  if (path && typeof path === "object" && "then" in path) {
    path = await path;
  }
  return Array.isArray(path) ? path : [];
}

async function proxyToBackend(request: NextRequest, routeParams: unknown): Promise<NextResponse> {
  const path = await resolvePath(routeParams);
  const search = request.nextUrl.search;
  const backendUrl = `${BACKEND_URL}/api/auth/${path.join("/")}${search}`;

  const headers = new Headers(request.headers);
  for (const name of SKIPPED_HEADERS) headers.delete(name);

  const fetchInit: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? null
        : (request.body as unknown as BodyInit),
    redirect: "manual",
    duplex: "half",
  };
  const response = await fetch(backendUrl, fetchInit);

  // Forward every response header verbatim so every Set-Cookie entry
  // (including duplicates/chunks) reaches the browser unchanged.
  const responseHeaders = new Headers(response.headers);

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
export async function HEAD(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
export async function POST(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
export async function PUT(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
export async function PATCH(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
export async function DELETE(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
export async function OPTIONS(request: NextRequest, params: unknown) {
  return proxyToBackend(request, params);
}
