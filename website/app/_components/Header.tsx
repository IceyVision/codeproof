import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 h-14 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight"
        >
          codeproof
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/editor"
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Editor
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
