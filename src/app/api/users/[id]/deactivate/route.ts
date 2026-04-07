import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // TODO: ユーザー無効化を実装
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
