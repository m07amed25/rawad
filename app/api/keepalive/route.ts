import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown DB error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
