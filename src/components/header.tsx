import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

const navigation = [
  { name: "ダッシュボード", href: "/" },
  { name: "案件一覧", href: "/projects" },
  { name: "案件作成", href: "/projects/new" },
  { name: "ユーザー管理", href: "/admin/users", adminOnly: true },
];

const roleLabel: Record<string, string> = {
  ADMIN: "管理者",
  MANAGER: "マネージャー",
  MEMBER: "メンバー",
};

interface HeaderProps {
  userName: string;
  userRole: string;
  currentPath?: string;
}

export function Header({ userName, userRole, currentPath }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ + ナビ */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              案件管理
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navigation
                .filter((item) => !item.adminOnly || userRole === "ADMIN")
                .map((item) => {
                  const isActive =
                    item.href === "/"
                      ? currentPath === "/"
                      : currentPath?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
            </nav>
          </div>

          {/* ユーザー情報 */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-700">{userName}</span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {roleLabel[userRole] || userRole}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
