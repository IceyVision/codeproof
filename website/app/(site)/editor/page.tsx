export default function EditorPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="h-10 px-6 flex items-center justify-between border-b border-black/10 dark:border-white/10 text-sm">
        <span className="text-foreground/60 font-mono">Untitled session</span>
        <div className="flex items-center gap-2">
          <select
            disabled
            className="h-7 rounded border border-black/10 dark:border-white/15 bg-transparent px-2 text-xs text-foreground/60 disabled:cursor-not-allowed"
            defaultValue="javascript"
            aria-label="Language"
          >
            <option value="javascript">JavaScript</option>
          </select>
          <button
            type="button"
            disabled
            className="h-7 rounded bg-foreground/10 px-3 text-xs font-medium text-foreground/50 disabled:cursor-not-allowed"
          >
            Run
          </button>
        </div>
      </div>
      <div className="flex-1 grid place-items-center text-foreground/40 font-mono text-sm">
        Editor loads here
      </div>
    </div>
  );
}
