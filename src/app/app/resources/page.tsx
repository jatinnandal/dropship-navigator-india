import { ExternalLink } from "lucide-react";
import { RESOURCE_CATALOG } from "@/lib/resources-catalog";

export default function ResourcesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">Tool picks</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">Resources</h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Vendor-neutral tools we reference across your launch plan. We are not affiliated with these
          services — always verify pricing and terms before signing up.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {RESOURCE_CATALOG.map((category) => (
          <section key={category.id} className="glass-panel-receded rounded-xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-slate-100">{category.title}</h2>
            <p className="text-muted mt-1 text-sm">{category.description}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {category.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="spotlight-card insight-tile insight-tile-info group flex h-full flex-col rounded-lg p-4 transition-colors hover:border-neutral-500"
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-100">
                      {link.name}
                      <ExternalLink className="h-3.5 w-3.5 text-info opacity-70 group-hover:opacity-100" />
                    </span>
                    <span className="text-muted mt-2 text-sm leading-5">{link.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
