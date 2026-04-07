"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export type CreateProjectState = {
  errors?: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    general?: string;
  };
  success?: boolean;
};

export async function createProject(
  _prevState: CreateProjectState | undefined,
  formData: FormData
): Promise<CreateProjectState> {
  const session = await auth();
  if (!session) {
    return { errors: { general: "ログインが必要です。" } };
  }

  const user = session.user as any;

  // Admin / Manager のみ作成可能
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { errors: { general: "案件を作成する権限がありません。" } };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "NOT_STARTED";
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  // バリデーション
  const errors: CreateProjectState["errors"] = {};

  if (!title) {
    errors.title = "案件名は必須です。";
  } else if (title.length > 255) {
    errors.title = "案件名は255文字以内で入力してください。";
  }

  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  if (startDate && endDate && startDate > endDate) {
    errors.endDate = "終了日は開始日より後の日付を指定してください。";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // DB に保存
  try {
    const project = await prisma.project.create({
      data: {
        title: title!,
        description,
        status: status as any,
        startDate,
        endDate,
        createdBy: user.id,
      },
    });

    console.log("[PROJECT] Created:", project.id, project.title);
  } catch (error) {
    console.error("[PROJECT] Create error:", error);
    return { errors: { general: "案件の作成に失敗しました。" } };
  }

  redirect("/projects");
}
