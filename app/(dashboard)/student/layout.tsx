import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/sign-in");

  // Fresh DB check — session cache may be stale after profile update
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isProfileComplete: true, role: true, onboardingCompleted: true },
  });

  if (!user || user.role !== "STUDENT") {
    redirect("/auth/sign-in");
  }

  // If profile is incomplete and onboarding is done, middleware redirects
  // to /student/complete-profile for all routes except itself.
  // The complete-profile page passes through this layout without redirect
  // because middleware already whitelisted it.

  return <>{children}</>;
}
