import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    return await auth.handler(req);
  } catch (err: unknown) {
    console.error("[Auth POST]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const isDbError =
      message.includes("Can't reach database") ||
      message.includes("PrismaClientInitializationError") ||
      message.includes("connect_timeout");
    return NextResponse.json(
      {
        error: isDbError
          ? "خادم قاعدة البيانات غير متاح حالياً، يرجى المحاولة بعد لحظات"
          : "حدث خطأ أثناء تسجيل الدخول",
      },
      { status: isDbError ? 503 : 500 },
    );
  }
}

export const GET = auth.handler;
