/**
 * 统一 API 响应格式
 */
import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: string, code = 400, status?: number) {
  return NextResponse.json(
    { success: false, error, code },
    { status: status || (code >= 500 ? 500 : code >= 400 ? code : 400) }
  );
}

export function unauthorized() {
  return fail("未授权访问", 401, 401);
}

export function forbidden() {
  return fail("无权限访问", 403, 403);
}

export function notFound(msg = "资源不存在") {
  return fail(msg, 404, 404);
}

export function serverError(error: string) {
  return fail(error, 500, 500);
}
