import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "zaojing-ai-jwt-secret-change-in-production"
);

const PUBLIC_PATHS = [
  "/", "/login", "/register",
  "/api/auth/login", "/api/auth/register",
  "/api/pay/wechat/notify", "/api/pay/alipay/notify",
  "/api/payment/wechat-callback",
  "/api/cms/config", "/api/packages",
  "/_next", "/favicon.ico",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith("/_next")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();
  if (pathname.match(/\.(ico|png|jpg|svg|css|js|woff2?)$/)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "") || req.cookies.get("zj_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "未登录", code: 401 }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", payload.userId as string);
      requestHeaders.set("x-user-role", payload.role as string);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return NextResponse.json({ success: false, error: "登录已过期", code: 401 }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
