import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 h-16 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-base font-semibold tracking-tight"
        >
          <Image
            src="/logo_black.png"
            alt=""
            width={160}
            height={160}
            priority
            className="h-8 w-8 dark:hidden"
          />
          <Image
            src="/logo_white.png"
            alt=""
            width={160}
            height={160}
            priority
            className="hidden h-8 w-8 dark:block"
          />
          codeproof
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/editor"
            className="text-base text-foreground/70 hover:text-foreground transition-colors"
          >
            Editor
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
