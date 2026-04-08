import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // TODO: ユーザー詳細取得を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // TODO: ユーザー更新を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
