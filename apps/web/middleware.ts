// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Bỏ qua các route auth của NextAuth
  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Các route cần đăng nhập
  const protectedRoutes = [/^\/account(\/|$)/, /^\/checkout(\/|$)/];
  const needsAuth = protectedRoutes.some((r) => r.test(req.nextUrl.pathname));
  if (!needsAuth) return NextResponse.next();

  // Kiểm tra token (JWT) bằng NEXTAUTH_SECRET
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  // Chưa đăng nhập → chuyển hướng đến trang đăng nhập (giữ callbackUrl)
  const url = req.nextUrl.clone();
  const callback = encodeURIComponent(
    req.nextUrl.pathname + (req.nextUrl.search || "")
  );
  url.pathname = "/login"; // Bạn đã đặt pages.signIn = '/login'
  url.search = `?callbackUrl=${callback}`;

  return NextResponse.redirect(url);
}

// Chỉ áp cho 2 nhóm route sau
export const config = {
  matcher: ["/account/:path*", "/checkout/:path*","/orders/:path*"],
};
