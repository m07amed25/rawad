import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
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

  if (!user || user.role !== "TEACHER") {
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
