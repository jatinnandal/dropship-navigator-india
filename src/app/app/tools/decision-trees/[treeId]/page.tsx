import { notFound } from "next/navigation";
import { DECISION_TREES } from "@/lib/decision-trees-data";
import { DecisionWizard } from "@/components/tools/decision-wizard";

export function generateStaticParams() {
  return DECISION_TREES.map((tree) => ({ treeId: tree.id }));
}

export default async function DecisionTreePage({
  params,
}: {
  params: Promise<{ treeId: string }>;
}) {
  const { treeId } = await params;
  const tree = DECISION_TREES.find((t) => t.id === treeId);

  if (!tree) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <nav className="text-muted mb-3 text-xs">
          <span>Tools</span>
          <span className="mx-1.5">/</span>
          <span>Decision Trees</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-200">{tree.title}</span>
        </nav>

        <p className="eyebrow inline-block">Decision tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          {tree.title}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          {tree.description}
        </p>
      </header>

      <DecisionWizard tree={tree} />
    </main>
  );
}
