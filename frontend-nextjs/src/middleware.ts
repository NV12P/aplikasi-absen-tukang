import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Edge Middleware — auth guard paling cepat (jalan sebelum server component).
 *
 * Aturan:
 * - Semua route di bawah /(dashboard)/* → wajib login
 * - /login → jika sudah login, redirect ke /dashboard
 * - /api/* → dikecualikan (punya auth check sendiri di handler)
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Kalau sudah login tapi akses /login → redirect ke dashboard
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Izinkan akses jika sudah ada token ATAU route adalah /login
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname === "/login") return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Jalankan middleware di semua route kecuali static files, _next, dan api/auth
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
