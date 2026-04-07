"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProject, type CreateProjectState } from "./actions";

const statusOptions = [
  { value: "NOT_STARTED", label: "未着手" },
  { value: "IN_PROGRESS", label: "進行中" },
  { value: "COMPLETED", label: "完了" },
  { value: "ON_HOLD", label: "保留" },
];

export function ProjectForm() {
  const [state, formAction, isPending] = useActionState<
    CreateProjectState | undefined,
    FormData
  >(createProject, undefined);

  return (
    <form action={formAction} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* 全般エラー */}
      {state?.errors?.general && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {state.errors.general}
        </div>
      )}

      {/* 案件名（必須） */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          案件名 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={`mt-1 block w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:outline-none ${
            state?.errors?.title
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
          placeholder="例: Webサイトリニューアル"
        />
        {state?.errors?.title && (
          <p className="mt-1 text-sm text-red-600">{state.errors.title}</p>
        )}
      </div>

      {/* 概要 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          概要
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="案件の概要を入力..."
        />
      </div>

      {/* ステータス */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          ステータス
        </label>
        <select
          id="status"
          name="status"
          defaultValue="NOT_STARTED"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 期間 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            開始日
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            終了予定日
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className={`mt-1 block w-full rounded-lg border px-4 py-3 text-gray-900 focus:ring-2 focus:outline-none ${
              state?.errors?.endDate
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {state?.errors?.endDate && (
            <p className="mt-1 text-sm text-red-600">{state.errors.endDate}</p>
          )}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <Link
          href="/projects"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "保存中..." : "案件を作成"}
        </button>
      </div>
    </form>
  );
}
