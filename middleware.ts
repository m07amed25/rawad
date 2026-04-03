import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ═══════════════════════════════════════════════════════════════
 *  middleware.ts — The Ultimate Route Protection Middleware
 *  ─────────────────────────────────────────────────────────────
 *  Uses Better-Auth's /api/auth/get-session to validate the
 *  session cookie on every navigation. All decisions are made
 *  at the edge BEFORE any page code executes.
 *
 *  Rules:
 *   1. Unauthenticated → /auth/sign-in   (for protected routes)
 *   2. STUDENT → blocked from /teacher/*  (redirect → /student)
 *   3. TEACHER → blocked from /student/*  (redirect → /teacher)
 *   4. Onboarding incomplete → /welcome/<role>
 *   5. Profile incomplete → /<role>/complete-profile
 *   6. Authenticated on /auth/* → redirect to dashboard
 * ═══════════════════════════════════════════════════════════════
 */

// ── Helper: build a redirect response ─────────────────────────
function redirect(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

// ── Helper: determine the dashboard root for a role ───────────
function dashboardFor(role: string | undefined): string {
  if (role === "STUDENT") return "/student";
  if (role === "TEACHER") return "/teacher";
  return "/";
}

// ── Routes that require NO authentication ─────────────────────
// (Public routes — landing page, auth pages, API, static assets)
const PUBLIC_PREFIXES = ["/auth", "/api", "/_next", "/fonts", "/images"];

function isPublicRoute(pathname: string): boolean {
  // The landing page "/" is public
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ── Routes that require authentication ────────────────────────
// Everything under /student, /teacher, /welcome is protected
const PROTECTED_PREFIXES = ["/student", "/teacher", "/welcome"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 0a. Never intercept Server Action requests ─────────────
  // They carry a `next-action` header and expect a specific
  // serialised payload back — not an HTML redirect.
  // Auth is already enforced inside every Server Action.
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  // ─── 0. Skip public / static routes early (lightweight) ────
  if (!isProtectedRoute(pathname) && isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ─── 1. Fetch the session from Better-Auth ─────────────────
  let session: {
    user?: {
      role?: string;
      onboardingCompleted?: boolean;
      isProfileComplete?: boolean;
    };
  } | null = null;

  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    if (res.ok) {
      session = await res.json();
    }
  } catch {
    // Network error — treat as unauthenticated for safety
  }

  const user = session?.user;
  const role = user?.role; // "STUDENT" | "TEACHER" | undefined
  const completed = user?.onboardingCompleted ?? false;
  const profileComplete = user?.isProfileComplete ?? false;

  const isAuthRoute = pathname.startsWith("/auth");
  const isWelcomeRoute = pathname.startsWith("/welcome");
  const isStudentRoute = pathname.startsWith("/student");
  const isTeacherRoute = pathname.startsWith("/teacher");

  // ─── 2. NOT LOGGED IN ──────────────────────────────────────
  if (!session || !user) {
    // Allow access to auth pages (sign-in, sign-up, etc.)
    if (isAuthRoute) return NextResponse.next();

    // Block all protected routes → redirect to sign-in
    if (isProtectedRoute(pathname)) {
      return redirect(request, "/auth/sign-in");
    }

    // Everything else passes through
    return NextResponse.next();
  }

  // ═══════════════════════════════════════════════════════════
  //  From here on, the user IS authenticated.
  // ═══════════════════════════════════════════════════════════

  // ─── 3. Authenticated user on /auth/* → go to dashboard ────
  if (isAuthRoute) {
    return redirect(request, dashboardFor(role));
  }

  // ─── 4. STRICT ROLE-BASED ROUTE BLOCKING ───────────────────
  //  STUDENT cannot access /teacher/* — redirect to /student
  //  TEACHER cannot access /student/* — redirect to /teacher
  if (role === "STUDENT" && isTeacherRoute) {
    return redirect(request, "/student");
  }
  if (role === "TEACHER" && isStudentRoute) {
    return redirect(request, "/teacher");
  }

  // ─── 5. ONBOARDING GATE ────────────────────────────────────
  //  If onboarding is NOT complete, force user to /welcome/<role>
  if (!completed && !isWelcomeRoute) {
    if (role === "STUDENT") return redirect(request, "/welcome/student");
    if (role === "TEACHER") return redirect(request, "/welcome/teacher");
  }

  //  If onboarding IS complete, block access to /welcome pages
  if (completed && isWelcomeRoute) {
    return redirect(request, dashboardFor(role));
  }

  // ─── 6. PROFILE COMPLETION GATE ────────────────────────────
  //  After onboarding, if profile is incomplete, force user to
  //  /<role>/complete-profile (but allow that page itself).
  if (completed && !profileComplete) {
    const completeProfilePath = `/${role === "STUDENT" ? "student" : "teacher"}/complete-profile`;

    if (
      pathname !== completeProfilePath &&
      (isStudentRoute || isTeacherRoute)
    ) {
      return redirect(request, completeProfilePath);
    }
  }

  //  If profile IS complete, block re-visiting complete-profile
  if (completed && profileComplete) {
    if (
      pathname === "/student/complete-profile" ||
      pathname === "/teacher/complete-profile"
    ) {
      return redirect(request, dashboardFor(role));
    }
  }

  // ─── 7. All checks passed — allow the request ─────────────
  return NextResponse.next();
}

// ── Matcher: run middleware on all routes except static assets ─
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts/|images/|api/).*)",
  ],
};
