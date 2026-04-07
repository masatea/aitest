import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  // TODO: 担当者解除を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
