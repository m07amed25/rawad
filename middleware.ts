import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let session = null;
  // Try to get session via native fetch
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    if (res.ok) {
      session = await res.json();
    }
  } catch {
    // Ignore fetch errors
  }

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isWelcomeRoute = pathname.startsWith("/welcome");

  if (!session) {
    if (isWelcomeRoute /* || pathname === "/" // Keeping "/" accessible or protected based on requirements */) {
      // Typically root should be protected if no session in onboarding apps 
      // but let's assume root is protected.
      if (pathname === "/") return NextResponse.redirect(new URL("/auth/sign-in", request.url));
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    return NextResponse.next();
  }

  // If logged in:
  const isStudent = session.user?.role === "STUDENT";
  const isTeacher = session.user?.role === "TEACHER";
  const completed = session.user?.onboardingCompleted;

  if (isAuthRoute) {
    if (isStudent) return NextResponse.redirect(new URL("/student", request.url));
    if (isTeacher) return NextResponse.redirect(new URL("/teacher", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!completed && !isWelcomeRoute && pathname !== "/") {
    if (isStudent) return NextResponse.redirect(new URL("/welcome/student", request.url));
    if (isTeacher) return NextResponse.redirect(new URL("/welcome/teacher", request.url));
  }

  if (completed && isWelcomeRoute) {
    if (isStudent) return NextResponse.redirect(new URL("/student", request.url));
    if (isTeacher) return NextResponse.redirect(new URL("/teacher", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
