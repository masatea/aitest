export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">案件詳細</h1>
      {/* TODO: 案件詳細表示を実装 */}
    </div>
  );
}
