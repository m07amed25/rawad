import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TeacherSettingsClient from "./TeacherSettingsClient";

/**
 * Server Component: fetches the real user data from the session
 * and passes it to the client settings component.
 */
export default async function TeacherSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <TeacherSettingsClient
      initialName={session.user.name ?? ""}
      email={session.user.email ?? ""}
      initialImage={session.user.image ?? ""}
      university={session.user.universityName ?? ""}
      department={session.user.department ?? ""}
    />
  );
}
