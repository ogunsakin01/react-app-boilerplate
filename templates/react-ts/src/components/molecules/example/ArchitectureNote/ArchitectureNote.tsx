// EXAMPLE - safe to delete.
export type ArchitectureLayer = {
  layer: 'Template' | 'Organisms' | 'Molecules' | 'Atoms' | 'Route' | 'Hook' | 'Lib';
  components: string[];
  purpose?: string;
};

export type ArchitectureNoteProps = {
  layers: ArchitectureLayer[];
  title?: string;
};

export function ArchitectureNote({
  layers,
  title = 'How this page is built',
}: ArchitectureNoteProps) {
  return (
    <footer
      aria-label={title}
      className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-transparent p-4"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm">
        {layers.map((row) => (
          <li key={row.layer} className="flex flex-col gap-0.5">
            <span className="font-medium">
              {row.layer}: <code className="font-mono text-xs">{row.components.join(', ')}</code>
            </span>
            {row.purpose ? <span className="text-muted">{row.purpose}</span> : null}
          </li>
        ))}
      </ul>
    </footer>
  );
}
