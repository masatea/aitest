import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. 環境変数チェック
  checks.AUTH_SECRET = process.env.AUTH_SECRET ? "SET" : "MISSING";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "SET" : "MISSING";
  checks.DATABASE_URL = process.env.DATABASE_URL ? "SET" : "MISSING";

  // 2. bcryptjs チェック
  try {
    const { compare } = await import("bcryptjs");
    checks.bcryptjs = typeof compare === "function" ? "OK" : "FAIL";
  } catch (e: any) {
    checks.bcryptjs = `ERROR: ${e.message}`;
  }

  // 3. Prisma チェック
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    checks.prisma = `OK (${count} users)`;
  } catch (e: any) {
    checks.prisma = `ERROR: ${e.message}`;
  }

  // 4. NextAuth チェック
  try {
    const { auth } = await import("@/lib/auth");
    checks.nextauth = typeof auth === "function" ? "OK" : "FAIL";
  } catch (e: any) {
    checks.nextauth = `ERROR: ${e.message}`;
  }

  console.log("[DEBUG] Health check results:", checks);

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    checks,
  });
}
