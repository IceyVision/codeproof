import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Extension } from "@codemirror/state";

const lightBase = EditorView.theme(
  {
    "&": {
      color: "#171717",
      backgroundColor: "transparent",
      height: "100%",
      fontSize: "14px",
    },
    ".cm-content": {
      caretColor: "#171717",
      fontFamily: "var(--font-mono)",
      padding: "16px 0",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#171717" },
    "&.cm-focused .cm-selectionBackground, ::selection, .cm-selectionBackground":
      {
        backgroundColor: "rgba(23, 23, 23, 0.12)",
      },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "rgba(23, 23, 23, 0.35)",
      border: "none",
      paddingRight: "12px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(23, 23, 23, 0.04)",
      color: "rgba(23, 23, 23, 0.7)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(23, 23, 23, 0.025)" },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 16px" },
    ".cm-scroller": { fontFamily: "var(--font-mono)" },
    "&.cm-focused": { outline: "none" },
  },
  { dark: false },
);

const lightHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "#af00db" },
  { tag: [t.name, t.deleted, t.character, t.macroName], color: "#001080" },
  { tag: [t.propertyName], color: "#0070c1" },
  { tag: [t.string, t.inserted, t.special(t.string)], color: "#a31515" },
  { tag: [t.function(t.variableName), t.labelName], color: "#795e26" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "#0070c1" },
  { tag: [t.definition(t.name), t.separator], color: "#001080" },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: "#267f99",
  },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "#000000" },
  { tag: [t.meta, t.comment], color: "#008000", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.link, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "#af00db" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#0000ff" },
  { tag: t.invalid, color: "#cd3131" },
]);

const darkBase = EditorView.theme(
  {
    "&": {
      height: "100%",
      fontSize: "14px",
      backgroundColor: "transparent",
    },
    ".cm-content": {
      fontFamily: "var(--font-mono)",
      padding: "16px 0",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      border: "none",
      paddingRight: "12px",
    },
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.03)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.04)" },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 16px" },
    ".cm-scroller": { fontFamily: "var(--font-mono)" },
    "&.cm-focused": { outline: "none" },
  },
  { dark: true },
);

export const lightTheme: Extension = [lightBase, syntaxHighlighting(lightHighlight)];
export const darkTheme: Extension = [oneDark, darkBase];
