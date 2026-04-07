import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/header";

const statusConfig: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "未着手", className: "bg-gray-100 text-gray-700" },
  IN_PROGRESS: { label: "進行中", className: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "完了", className: "bg-green-100 text-green-800" },
  ON_HOLD: { label: "保留", className: "bg-red-100 text-red-800" },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const statusFilter = params?.status;
  const query = params?.q;

  const user = session.user as any;

  // フィルタ条件を構築
  const where: any = { isArchived: false };
  if (statusFilter && statusFilter in statusConfig) {
    where.status = statusFilter;
  }
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      creator: { select: { name: true } },
      assignments: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const canCreate = user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.name} userRole={user.role} currentPath="/projects" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">案件一覧</h2>
          {canCreate && (
            <Link
              href="/projects/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              + 新規作成
            </Link>
          )}
        </div>

        {/* フィルタバー */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form method="GET" className="flex flex-wrap items-center gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                name="q"
                defaultValue={query || ""}
                placeholder="案件名・概要で検索..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* ステータスフィルタ */}
            <select
              name="status"
              defaultValue={statusFilter || ""}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">すべてのステータス</option>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              検索
            </button>
            {(statusFilter || query) && (
              <Link
                href="/projects"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                クリア
              </Link>
            )}
          </form>
        </div>

        {/* 案件テーブル */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              {statusFilter || query
                ? "条件に一致する案件がありません。"
                : "まだ案件がありません。"}
            </p>
            {canCreate && (
              <Link
                href="/projects/new"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                最初の案件を作成する
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    案件名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期間
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成者
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => {
                  const config = statusConfig[project.status] || {
                    label: project.status,
                    className: "bg-gray-100 text-gray-700",
                  };
                  const isOverdue =
                    project.endDate &&
                    project.endDate < new Date() &&
                    project.status !== "COMPLETED";

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {project.title}
                        </Link>
                        {project.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500">
                        {project.assignments.length > 0
                          ? project.assignments
                              .map((a) => a.user.name)
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                        <div>
                          {project.startDate
                            ? project.startDate.toLocaleDateString("ja-JP")
                            : "—"}
                          {" 〜 "}
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {project.endDate
                              ? project.endDate.toLocaleDateString("ja-JP")
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500">
                        {project.creator.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 件数表示 */}
        <p className="mt-4 text-sm text-gray-500">
          {projects.length} 件の案件
          {statusFilter && ` (${statusConfig[statusFilter]?.label || statusFilter})`}
        </p>
      </main>
    </div>
  );
}
