"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import type { Extension } from "@codemirror/state";
import { THEME_CHANGE_EVENT, type Theme, getCurrentTheme } from "../_lib/theme";
import { darkTheme, lightTheme } from "../_lib/editor-theme";

type Language = "javascript" | "typescript" | "python";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
];

const DEFAULT_LANGUAGE: Language = "javascript";

const STARTER_DOCS: Record<Language, string> = {
  javascript: `// Welcome to Codeproof
// Every keystroke here will be replayable.

function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
  typescript: `// Welcome to Codeproof
// Every keystroke here will be replayable.

function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
  python: `# Welcome to Codeproof
# Every keystroke here will be replayable.

def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return None

print(two_sum([2, 7, 11, 15], 9))
`,
};

function languageExtension(lang: Language): Extension {
  switch (lang) {
    case "javascript":
      return javascript();
    case "typescript":
      return javascript({ typescript: true });
    case "python":
      return python();
  }
}

function themeExtension(theme: Theme): Extension {
  return theme === "dark" ? darkTheme : lightTheme;
}

export function Workspace() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  const languageCompartment = useRef(new Compartment());
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [sessionName, setSessionName] = useState("Untitled session");

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const initialTheme = getCurrentTheme();
    const state = EditorState.create({
      doc: STARTER_DOCS[DEFAULT_LANGUAGE],
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        foldGutter(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        indentUnit.of("  "),
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        languageCompartment.current.of(languageExtension(DEFAULT_LANGUAGE)),
        themeCompartment.current.of(themeExtension(initialTheme)),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    function onThemeChange(e: Event) {
      const next = (e as CustomEvent<Theme>).detail ?? getCurrentTheme();
      view.dispatch({
        effects: themeCompartment.current.reconfigure(themeExtension(next)),
      });
    }
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  const onLanguageChange = useCallback((next: Language) => {
    const view = viewRef.current;
    if (!view) {
      setLanguage(next);
      return;
    }
    view.dispatch({
      effects: languageCompartment.current.reconfigure(languageExtension(next)),
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: STARTER_DOCS[next],
      },
    });
    setLanguage(next);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="h-11 shrink-0 px-6 flex items-center justify-between border-b border-black/10 dark:border-white/10 text-sm">
        <div className="flex items-center gap-3 min-w-0">
          <input
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="font-mono text-foreground/80 bg-transparent border border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-black/20 dark:focus:border-white/20 rounded px-2 py-1 outline-none transition-colors min-w-0 w-64"
            aria-label="Session name"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="h-8 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-2 text-xs text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} className="bg-background">
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled
            title="Run via Judge0 (not wired up yet)"
            className="h-8 rounded-md bg-foreground/10 px-3 text-xs font-medium text-foreground/50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Run
          </button>
          <button
            type="button"
            disabled
            title="Share (requires persistence, not wired up yet)"
            className="h-8 rounded-md border border-black/10 dark:border-white/15 px-3 text-xs font-medium text-foreground/50 disabled:cursor-not-allowed"
          >
            Share
          </button>
        </div>
      </div>
      <div
        ref={hostRef}
        className="flex-1 min-h-0 overflow-hidden bg-background"
      />
    </div>
  );
}
