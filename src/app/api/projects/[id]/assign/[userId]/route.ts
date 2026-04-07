import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  // TODO: 担当者解除を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
