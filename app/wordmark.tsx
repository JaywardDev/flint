type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={`font-serif uppercase tracking-[0.32em] text-obsidian ${className ?? ""}`}
    >
      Flint
    </span>
  );
}

export function EmberDivider({ className }: WordmarkProps) {
  return (
    <span
      className={`flex items-center gap-3 text-ember ${className ?? ""}`}
      aria-hidden
    >
      <span className="h-px w-8 bg-ember/40" />
      <span className="inline-block h-1.5 w-1.5 rotate-45 bg-ember" />
      <span className="h-px w-8 bg-ember/40" />
    </span>
  );
}
