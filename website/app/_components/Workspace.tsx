"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorState, Compartment, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  type ViewUpdate,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
} from "@codemirror/language";
import { THEME_CHANGE_EVENT, type Theme, getCurrentTheme } from "../_lib/theme";
import { darkTheme, lightTheme } from "../_lib/editor-theme";
import {
  MAX_TABS,
  defaultFilenameForNewTab,
  isValidFilename,
  languageExtensionFor,
  newTabId,
  type TabId,
  type TabMeta,
} from "../_lib/tabs";
import { TabStrip } from "./TabStrip";

const STARTER_DOC = `// main.js — welcome to Codeproof
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
`;

function themeExtension(theme: Theme): Extension {
  return theme === "dark" ? darkTheme : lightTheme;
}

type Compartments = { theme: Compartment; language: Compartment };

const WS_URL =
  process.env.NEXT_PUBLIC_BACKEND_WS ?? "ws://localhost:8080/ws";

function createTabState(
  doc: string,
  filename: string,
  theme: Theme,
  comps: Compartments,
  onUpdate: (u: ViewUpdate) => void,
): EditorState {
  const lang = languageExtensionFor(filename);
  return EditorState.create({
    doc,
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
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab,
      ]),
      comps.language.of(lang ?? []),
      comps.theme.of(themeExtension(theme)),
      EditorView.lineWrapping,
      EditorView.updateListener.of(onUpdate),
    ],
  });
}

function reconcileThemeOnState(
  state: EditorState,
  comps: Compartments,
  theme: Theme,
): EditorState {
  const tx = state.update({
    effects: comps.theme.reconfigure(themeExtension(theme)),
  });
  return tx.state;
}

export function Workspace() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const compsRef = useRef<Compartments>({
    theme: new Compartment(),
    language: new Compartment(),
  });
  const statesRef = useRef<Map<TabId, EditorState>>(new Map());
  const activeIdRef = useRef<TabId | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const sendEdit = useCallback((u: ViewUpdate) => {
    if (!u.docChanged || u.transactions.length === 0) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "edit",
        tabId: activeIdRef.current,
        ts: Date.now(),
        changes: u.changes.toJSON(),
      }),
    );
  }, []);

  const [tabs, setTabs] = useState<TabMeta[]>(() => [
    { id: newTabId(), name: "main.js" },
  ]);
  const [activeId, setActiveId] = useState<TabId>(() => tabs[0].id);
  const [sessionName, setSessionName] = useState("Untitled session");

  // Keep a ref so callbacks can read the latest active id without capturing it
  // (avoids re-running the mount effect and keeps close-over-handler references stable).
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Mount the view once, with the initial tab's state.
  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const firstTab = tabs[0];
    const theme = getCurrentTheme();
    const state = createTabState(
      STARTER_DOC,
      firstTab.name,
      theme,
      compsRef.current,
      sendEdit,
    );
    statesRef.current.set(firstTab.id, state);

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.addEventListener("open", () => console.log("[ws] connected to", WS_URL));
    ws.addEventListener("close", (e) =>
      console.log("[ws] closed", e.code, e.reason || ""),
    );
    ws.addEventListener("error", () => console.warn("[ws] error"));
    ws.addEventListener("message", (e) => console.log("[ws] <-", e.data));

    function onThemeChange() {
      const v = viewRef.current;
      if (!v) return;
      v.dispatch({
        effects: compsRef.current.theme.reconfigure(
          themeExtension(getCurrentTheme()),
        ),
      });
    }
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
      view.destroy();
      viewRef.current = null;
      ws.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swapTo = useCallback(
    (nextId: TabId, nextFilename: string) => {
      const view = viewRef.current;
      if (!view) return;

      const leavingId = activeIdRef.current;
      if (leavingId && leavingId !== nextId) {
        statesRef.current.set(leavingId, view.state);
      }

      const theme = getCurrentTheme();
      let next = statesRef.current.get(nextId);
      if (!next) {
        next = createTabState(
          "",
          nextFilename,
          theme,
          compsRef.current,
          sendEdit,
        );
        statesRef.current.set(nextId, next);
      } else {
        next = reconcileThemeOnState(next, compsRef.current, theme);
      }

      view.setState(next);
      view.focus();
    },
    [sendEdit],
  );

  const activate = useCallback(
    (id: TabId) => {
      if (id === activeIdRef.current) {
        viewRef.current?.focus();
        return;
      }
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;
      swapTo(id, tab.name);
      setActiveId(id);
    },
    [tabs, swapTo],
  );

  const createTab = useCallback(() => {
    setTabs((prev) => {
      if (prev.length >= MAX_TABS) return prev;
      const name = defaultFilenameForNewTab(prev);
      const id = newTabId();
      swapTo(id, name);
      setActiveId(id);
      return [...prev, { id, name }];
    });
  }, [swapTo]);

  const closeTab = useCallback(
    (id: TabId) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex((t) => t.id === id);
        if (idx < 0) return prev;
        const next = prev.filter((t) => t.id !== id);
        statesRef.current.delete(id);

        if (id === activeIdRef.current) {
          const neighborIdx = Math.min(idx, next.length - 1);
          const neighbor = next[neighborIdx];
          swapTo(neighbor.id, neighbor.name);
          setActiveId(neighbor.id);
        }
        return next;
      });
    },
    [swapTo],
  );

  const renameTab = useCallback(
    (id: TabId, name: string): boolean => {
      if (!isValidFilename(name)) return false;
      const trimmed = name.trim();
      let ok = true;
      setTabs((prev) => {
        if (prev.some((t) => t.id !== id && t.name === trimmed)) {
          ok = false;
          return prev;
        }
        return prev.map((t) => (t.id === id ? { ...t, name: trimmed } : t));
      });
      if (ok && id === activeIdRef.current && viewRef.current) {
        const lang = languageExtensionFor(trimmed);
        viewRef.current.dispatch({
          effects: compsRef.current.language.reconfigure(lang ?? []),
        });
      }
      return ok;
    },
    [],
  );

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
          <span className="text-foreground/40 text-xs font-mono">
            {tabs.length} {tabs.length === 1 ? "file" : "files"}
          </span>
        </div>
        <div className="flex items-center gap-2">
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

      <TabStrip
        tabs={tabs}
        activeId={activeId}
        onActivate={activate}
        onClose={closeTab}
        onRename={renameTab}
        onNew={createTab}
      />

      <div
        ref={hostRef}
        className="flex-1 min-h-0 overflow-hidden bg-background"
      />
    </div>
  );
}
