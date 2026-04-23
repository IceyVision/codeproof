import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-mono text-5xl font-bold tracking-tight">
        Codeproof
      </h1>
      <p className="mt-4 text-xl text-foreground/70">
        A collaborative code editor that replays every keystroke.
      </p>
      <p className="mt-6 text-foreground/60 leading-relaxed">
        Two people join a room and code together in real time. The entire
        session — every edit, deletion, cursor move, and run — is captured as a
        scrubbable timeline. The replay is the product: share a link and show
        how you got there, not just the final code.
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href="/editor"
          className="inline-flex h-10 items-center rounded-md bg-foreground text-background px-4 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try the editor →
        </Link>
        <a
          href="#"
          className="inline-flex h-10 items-center rounded-md border border-black/10 dark:border-white/15 px-4 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
