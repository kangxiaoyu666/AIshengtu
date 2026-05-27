import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "zaojing-ai-jwt-secret-change-in-production"
);
const TOKEN_EXPIRY = "7d";
const COOKIE_NAME = "zj_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 从请求提取用户身份。
 * 优先读取中间件注入的 x-user-id（避免重复验签），
 * 其次从 Authorization header / Cookie 验 JWT。
 */
export async function getUserFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  // 1. 中间件注入的 header（已验证）
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");
  if (userId) {
    return { userId, email: "", role: role || "user" };
  }

  // 2. Authorization header
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.replace("Bearer ", "");
  if (bearerToken) return verifyToken(bearerToken);

  // 3. Cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token) return verifyToken(token);

  return null;
}

export async function setAuthCookie(payload: JwtPayload) {
  const token = await signToken(payload);
  const ck = await cookies();
  ck.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return token;
}

export async function clearAuthCookie() {
  const ck = await cookies();
  ck.delete(COOKIE_NAME);
}
