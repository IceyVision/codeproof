import type { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";

export type TabId = string;
export type TabMeta = { id: TabId; name: string };

export const MAX_TABS = 20;

export function newTabId(): TabId {
  return crypto.randomUUID();
}

export function languageExtensionFor(filename: string): Extension | null {
  const ext = filename.includes(".")
    ? filename.slice(filename.lastIndexOf(".") + 1).toLowerCase()
    : "";
  switch (ext) {
    case "js":
    case "mjs":
    case "cjs":
      return javascript();
    case "jsx":
      return javascript({ jsx: true });
    case "ts":
      return javascript({ typescript: true });
    case "tsx":
      return javascript({ typescript: true, jsx: true });
    case "py":
      return python();
    case "md":
    case "markdown":
      return markdown();
    default:
      return null;
  }
}

export function defaultFilenameForNewTab(existing: TabMeta[]): string {
  const used = new Set(existing.map((t) => t.name));
  let n = 1;
  while (used.has(`untitled-${n}.js`)) n++;
  return `untitled-${n}.js`;
}

export function isValidFilename(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) return false;
  if (/[\\/]/.test(trimmed)) return false;
  return true;
}
