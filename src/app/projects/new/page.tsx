import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { ProjectForm } from "./form";

export default async function ProjectNewPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;

  // 権限チェック
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userName={user.name}
        userRole={user.role}
        currentPath="/projects/new"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">案件作成</h2>
        <ProjectForm />
      </main>
    </div>
  );
}
