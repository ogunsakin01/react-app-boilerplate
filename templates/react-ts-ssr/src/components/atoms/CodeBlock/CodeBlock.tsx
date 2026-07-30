export type CodeBlockProps = {
  code: string;
  filePath?: string;
  language?: string;
};

export function CodeBlock({ code, filePath, language }: CodeBlockProps) {
  const trimmed = code.replace(/\s+$/g, '');
  const captionId = filePath ? `codeblock-${slugify(filePath)}` : undefined;

  return (
    <figure className="flex flex-col gap-1">
      <pre
        className="overflow-x-auto rounded-md border border-border bg-transparent p-4 text-xs leading-relaxed"
        aria-describedby={captionId}
      >
        <code data-language={language}>{trimmed}</code>
      </pre>
      {filePath ? (
        <figcaption
          id={captionId}
          className="pl-1 font-mono text-[11px] uppercase tracking-wide text-muted"
        >
          {filePath}
        </figcaption>
      ) : null}
    </figure>
  );
}

function slugify(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
