"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { MAX_TABS, type TabId, type TabMeta } from "../_lib/tabs";

type Props = {
  tabs: TabMeta[];
  activeId: TabId;
  onActivate: (id: TabId) => void;
  onClose: (id: TabId) => void;
  onRename: (id: TabId, name: string) => boolean;
  onNew: () => void;
};

export function TabStrip({ tabs, activeId, onActivate, onClose, onRename, onNew }: Props) {
  const atLimit = tabs.length >= MAX_TABS;

  return (
    <div
      role="tablist"
      className="h-9 shrink-0 flex items-stretch border-b border-black/10 dark:border-white/10 bg-background"
    >
      <div className="flex-1 flex items-stretch overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={tab.id === activeId}
            canClose={tabs.length > 1}
            onActivate={() => onActivate(tab.id)}
            onClose={() => onClose(tab.id)}
            onRename={(name) => onRename(tab.id, name)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onNew}
        disabled={atLimit}
        title={atLimit ? `Tab limit reached (${MAX_TABS})` : "New tab"}
        aria-label="New tab"
        className="shrink-0 w-9 grid place-items-center text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-l border-black/10 dark:border-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

type TabItemProps = {
  tab: TabMeta;
  active: boolean;
  canClose: boolean;
  onActivate: () => void;
  onClose: () => void;
  onRename: (name: string) => boolean;
};

function TabItem({ tab, active, canClose, onActivate, onClose, onRename }: TabItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tab.name);
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [active]);

  function startEdit() {
    setDraft(tab.name);
    setEditing(true);
  }

  function commit() {
    const name = draft.trim();
    if (name === tab.name || !name) {
      setEditing(false);
      setDraft(tab.name);
      return;
    }
    const ok = onRename(name);
    if (!ok) {
      setDraft(tab.name);
    }
    setEditing(false);
  }

  function cancel() {
    setDraft(tab.name);
    setEditing(false);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  function onInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value;
    const dot = value.lastIndexOf(".");
    if (dot > 0) e.target.setSelectionRange(0, dot);
    else e.target.select();
  }

  function onCloseClick(e: MouseEvent) {
    e.stopPropagation();
    onClose();
  }

  function onMiddleMouse(e: MouseEvent) {
    if (e.button === 1 && canClose) {
      e.preventDefault();
      onClose();
    }
  }

  const baseClass = active
    ? "bg-black/[0.03] dark:bg-white/[0.04] text-foreground"
    : "text-foreground/55 hover:text-foreground hover:bg-black/[0.025] dark:hover:bg-white/[0.03]";

  return (
    <div
      ref={ref}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={editing ? undefined : onActivate}
      onDoubleClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
      onAuxClick={onMiddleMouse}
      className={`group relative flex items-center gap-2 pl-3 pr-1.5 h-full border-r border-black/10 dark:border-white/10 text-xs font-mono cursor-pointer select-none min-w-0 max-w-[220px] transition-colors ${baseClass}`}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-foreground"
        />
      ) : null}

      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onInputKeyDown}
          onBlur={commit}
          onFocus={onInputFocus}
          onClick={(e) => e.stopPropagation()}
          spellCheck={false}
          aria-label={`Rename ${tab.name}`}
          className="bg-transparent outline-none border-b border-foreground/40 min-w-0 flex-1 py-0.5 font-mono"
        />
      ) : (
        <span className="truncate flex-1">{tab.name}</span>
      )}

      <button
        type="button"
        onClick={onCloseClick}
        onDoubleClick={(e) => e.stopPropagation()}
        disabled={!canClose}
        aria-label={`Close ${tab.name}`}
        title={canClose ? "Close" : "Can't close last tab"}
        className={`shrink-0 w-5 h-5 grid place-items-center rounded text-foreground/50 hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-opacity ${
          canClose
            ? active
              ? "opacity-70 hover:opacity-100"
              : "opacity-0 group-hover:opacity-70 focus-visible:opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
