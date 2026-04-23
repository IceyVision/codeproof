export type Theme = "light" | "dark";

export const STORAGE_KEY = "codeproof-theme";

export function applyTheme(t: Theme): void {
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem(STORAGE_KEY, t);
}
