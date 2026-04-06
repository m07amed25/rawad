import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  teacherVerification: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // 1. Get the session
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      // 2. If no session or not a teacher, throw
      if (!session?.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized — Only teachers can upload verification documents");
      }

      // 3. Metadata for the file
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  profileImage: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user) {
        throw new Error("Unauthorized — Please sign in to upload a profile image");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
