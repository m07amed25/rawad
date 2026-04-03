import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasourceUrl: appendPoolParams(process.env.DATABASE_URL),
  });
}

/**
 * Append connection-pool tuning params if not already present.
 * - connection_limit=10  keeps dev from hogging all server slots
 * - pool_timeout=30      gives more headroom before timing out
 */
function appendPoolParams(url: string | undefined): string | undefined {
  if (!url) return url;
  const u = new URL(url);
  if (!u.searchParams.has("connection_limit")) {
    u.searchParams.set("connection_limit", "10");
  }
  if (!u.searchParams.has("pool_timeout")) {
    u.searchParams.set("pool_timeout", "30");
  }
  return u.toString();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
