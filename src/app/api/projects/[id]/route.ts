import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // TODO: 案件詳細取得を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // TODO: 案件更新を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // TODO: 案件削除（論理削除）を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
