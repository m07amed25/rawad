import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const latestMessage = await prisma.examMessage.findFirst({
      where: {
        examId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestMessage) {
      return NextResponse.json({ message: null });
    }

    return NextResponse.json({
      id: latestMessage.id,
      message: latestMessage.content,
      createdAt: latestMessage.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}
