import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Header } from "@/components/header";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;

  // 案件サマリーをDBから取得
  const [totalCount, inProgressCount, completedCount, onHoldCount] =
    await Promise.all([
      prisma.project.count({ where: { isArchived: false } }),
      prisma.project.count({
        where: { status: "IN_PROGRESS", isArchived: false },
      }),
      prisma.project.count({
        where: { status: "COMPLETED", isArchived: false },
      }),
      prisma.project.count({
        where: { status: "ON_HOLD", isArchived: false },
      }),
    ]);

  // 自分の担当案件を取得
  const myProjects = await prisma.projectAssignment.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: { creator: { select: { name: true } } },
      },
    },
    orderBy: { project: { updatedAt: "desc" } },
    take: 5,
  });

  // 期限切れ・期限間近の案件
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const urgentProjects = await prisma.project.findMany({
    where: {
      isArchived: false,
      status: { not: "COMPLETED" },
      endDate: { lte: threeDaysLater },
    },
    orderBy: { endDate: "asc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.name} userRole={user.role} currentPath="/" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ダッシュボード
        </h2>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SummaryCard
            title="全案件数"
            value={totalCount}
            color="blue"
            href="/projects"
          />
          <SummaryCard
            title="進行中"
            value={inProgressCount}
            color="yellow"
            href="/projects?status=IN_PROGRESS"
          />
          <SummaryCard
            title="完了"
            value={completedCount}
            color="green"
            href="/projects?status=COMPLETED"
          />
          <SummaryCard
            title="保留"
            value={onHoldCount}
            color="red"
            href="/projects?status=ON_HOLD"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 担当案件 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                あなたの担当案件
              </h3>
              <Link
                href="/projects"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて見る
              </Link>
            </div>
            {myProjects.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">
                担当案件はありません。
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {myProjects.map((a) => (
                  <li key={a.id} className="py-3">
                    <Link
                      href={`/projects/${a.project.id}`}
                      className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {a.project.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          作成者: {a.project.creator.name}
                        </p>
                      </div>
                      <StatusBadge status={a.project.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 期限アラート */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              期限切れ・期限間近
            </h3>
            {urgentProjects.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">
                期限切れの案件はありません。
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {urgentProjects.map((p) => {
                  const isOverdue = p.endDate && p.endDate < now;
                  return (
                    <li key={p.id} className="py-3">
                      <Link
                        href={`/projects/${p.id}`}
                        className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.title}
                          </p>
                          <p
                            className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-yellow-600"}`}
                          >
                            {isOverdue ? "期限切れ: " : "期限: "}
                            {p.endDate
                              ? p.endDate.toLocaleDateString("ja-JP")
                              : "未設定"}
                          </p>
                        </div>
                        <StatusBadge status={p.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction
            href="/projects"
            title="案件一覧"
            description="すべての案件を表示・管理"
            icon="📋"
          />
          <QuickAction
            href="/projects/new"
            title="案件作成"
            description="新しい案件を登録"
            icon="➕"
          />
          {user.role === "ADMIN" && (
            <QuickAction
              href="/admin/users"
              title="ユーザー管理"
              description="ユーザーの追加・編集"
              icon="👥"
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- 子コンポーネント ---------- */

function SummaryCard({
  title,
  value,
  color,
  href,
}: {
  title: string;
  value: number;
  color: string;
  href: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Link
      href={href}
      className={`rounded-lg border p-6 transition-shadow hover:shadow-md ${colorMap[color]}`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow border border-gray-200"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NOT_STARTED: {
    label: "未着手",
    className: "bg-gray-100 text-gray-700",
  },
  IN_PROGRESS: {
    label: "進行中",
    className: "bg-yellow-100 text-yellow-800",
  },
  COMPLETED: {
    label: "完了",
    className: "bg-green-100 text-green-800",
  },
  ON_HOLD: {
    label: "保留",
    className: "bg-red-100 text-red-800",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
