import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // TODO: 担当者アサインを実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
