import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // TODO: 担当者アサインを実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
