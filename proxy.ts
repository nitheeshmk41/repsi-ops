import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api routes, and public images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon") ||
    pathname.includes("dark_logo_trans.png") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Check internal session cookie
  const session =
    request.cookies.get("appwrite-session")?.value ||
    request.cookies.get("repsi_session")?.value;
  const userRole = request.cookies.get("repsi_role")?.value || "ADMIN";

  // Role-based route enforcement
  if (userRole) {
    // Sales can only access CRM and Sales
    if (userRole === "SALES") {
      if (
        pathname.startsWith("/bugs") ||
        pathname.startsWith("/product") ||
        pathname.startsWith("/project")
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Developer can access Project, Tasks, Modules, Bugs, but not CRM
    if (userRole === "DEVELOPER") {
      if (pathname.startsWith("/crm") || pathname.startsWith("/sales")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // QA can access Bugs, QA, Releases, Modules
    if (userRole === "QA") {
      if (pathname.startsWith("/crm") || pathname.startsWith("/sales")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
