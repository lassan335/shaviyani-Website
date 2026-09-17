import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/adminAuth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const session = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
