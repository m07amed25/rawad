import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import StudentSettingsClient from "./StudentSettingsClient";

export default async function StudentSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <StudentSettingsClient
      initialName={session.user.name ?? ""}
      email={session.user.email ?? ""}
      initialImage={session.user.image ?? ""}
      university={session.user.universityName ?? ""}
      department={session.user.department ?? ""}
    />
  );
}
