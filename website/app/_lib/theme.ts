export type Theme = "light" | "dark";

export const STORAGE_KEY = "codeproof-theme";
export const THEME_CHANGE_EVENT = "codeproof:theme-change";

export function applyTheme(t: Theme): void {
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem(STORAGE_KEY, t);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: t }));
}

export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
