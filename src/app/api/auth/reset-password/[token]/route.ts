import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  // TODO: パスワード再設定処理を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
