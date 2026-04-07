import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { token: string } }) {
  // TODO: パスワード再設定処理を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
