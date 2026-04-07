export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">案件編集</h1>
      {/* TODO: 案件編集フォームを実装 */}
    </div>
  );
}
