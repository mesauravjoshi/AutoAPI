import { useEffect, useRef, useState } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditorNS, Position, languages } from "monaco-editor";

const envVariables = [
  "base-url",
  "api-key",
  "auth-token",
  "user-id",
  "workspace-id",
];

const LANGUAGE_ID = "url-template";
const LIGHT_THEME = "url-editor-light";
const DARK_THEME = "url-editor-dark";

interface UrlEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function UrlEditor({
  value,
  onChange,
  placeholder = "Enter URL...",
}: UrlEditorProps) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Keep Monaco's theme in sync with Tailwind's `dark` class on <html>.
  useEffect(() => {
    const applyTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      monacoRef.current?.editor.setTheme(isDark ? DARK_THEME : LIGHT_THEME);
    };

    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const stripNewlines = (text: string) => text.replace(/\r?\n/g, "");

  const handleEditorWillMount = (monaco: Monaco) => {
    // Register a tiny language so we can tokenize {{env}} placeholders
    // differently from the rest of the text.
    if (!monaco.languages.getLanguages().some((l:any) => l.id === LANGUAGE_ID)) {
      monaco.languages.register({ id: LANGUAGE_ID });

      monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
        tokenizer: {
          root: [
            [/\{\{[^}]*\}\}/, "env-variable"],
            [/[^{]+/, ""],
            [/\{/, ""],
          ],
        },
      });

      monaco.editor.defineTheme(LIGHT_THEME, {
        base: "vs",
        inherit: true,
        rules: [
          { token: "env-variable", foreground: "4f46e5", fontStyle: "bold" }, // indigo-600
        ],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#111827", // gray-900
          "editorCursor.foreground": "#111827",
          "editor.lineHighlightBackground": "#ffffff",
          "editor.lineHighlightBorder": "#ffffff",
          "editor.selectionBackground": "#c7d2fe",
          "editorSuggestWidget.background": "#ffffff",
          "editorSuggestWidget.border": "#d1d5db",
        },
      });

      monaco.editor.defineTheme(DARK_THEME, {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "env-variable", foreground: "a5b4fc", fontStyle: "bold" }, // indigo-300
        ],
        colors: {
          "editor.background": "#1f2937", // gray-800
          "editor.foreground": "#ffffff",
          "editorCursor.foreground": "#ffffff",
          "editor.lineHighlightBackground": "#1f2937",
          "editor.lineHighlightBorder": "#1f2937",
          "editor.selectionBackground": "#3730a3",
          "editorSuggestWidget.background": "#1f2937",
          "editorSuggestWidget.border": "#4b5563",
        },
      });
    }
  };

  const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    const isDark = document.documentElement.classList.contains("dark");
    monaco.editor.setTheme(isDark ? DARK_THEME : LIGHT_THEME);

    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
      triggerCharacters: ["{"],

      provideCompletionItems(
        model: MonacoEditorNS.ITextModel,
        position: Position
      ): languages.ProviderResult<languages.CompletionList> {
        const line = model.getLineContent(position.lineNumber);
        const textBeforeCursor = line.substring(0, position.column - 1);
        const match = textBeforeCursor.match(/\{\{([^}]*)$/);

        if (!match) {
          return { suggestions: [] };
        }

        const query = match[1].toLowerCase();

        const suggestions: languages.CompletionItem[] = envVariables
          .filter((env) => env.toLowerCase().includes(query))
          .map((env) => ({
            label: env,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: `${env}}}`,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - query.length,
              endColumn: position.column,
            },
          }));

        return { suggestions };
      },
    });

    // --- Single-line behavior -------------------------------------------------

    // Block Enter/Shift+Enter from inserting a newline, but only when the
    // suggestion widget isn't open (so Enter can still accept a suggestion).
    editorInstance.addCommand(
      monaco.KeyCode.Enter,
      () => {
        /* no-op: swallow Enter to prevent a new line */
      },
      "!suggestWidgetVisible"
    );
    editorInstance.addCommand(
      monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        /* no-op */
      },
      "!suggestWidgetVisible"
    );

    // Strip newlines from pasted content (or anything else that manages to
    // introduce one) so the editor always stays a single line.
    editorInstance.onDidPaste(() => {
      const model = editorInstance.getModel();
      if (!model) return;

      const currentValue = model.getValue();
      if (currentValue.includes("\n")) {
        const position = editorInstance.getPosition();
        const cleaned = stripNewlines(currentValue);
        model.setValue(cleaned);
        if (position) {
          editorInstance.setPosition({
            lineNumber: 1,
            column: Math.min(position.column, cleaned.length + 1),
          });
        }
      }
    });

    editorInstance.onDidFocusEditorText(() => setIsFocused(true));
    editorInstance.onDidBlurEditorText(() => setIsFocused(false));

    editorInstance.onDidChangeModelContent(() => {
      const model = editorInstance.getModel();
      const currentValue = model?.getValue() ?? "";
      setIsEmpty(currentValue.length === 0);
      onChange?.(currentValue);
    });
  };

  return (
    <div
      className={`relative block w-full rounded-md bg-white dark:bg-gray-800 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 transition-colors ${
        isFocused
          ? "outline-2 -outline-offset-2 outline-indigo-500 dark:outline-indigo-400"
          : ""
      }`}
    >
      {isEmpty && !isFocused && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base sm:text-sm/6 text-gray-400 dark:text-gray-500 select-none">
          {placeholder}
        </span>
      )}
      <Editor
        height="44px"
        width='114px'
        defaultLanguage={LANGUAGE_ID}
        defaultValue={value ?? ""}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          lineNumbers: "off",
          glyphMargin: false,
          folding: false,
          // lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          scrollBeyondLastLine: false,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
          },
          wordWrap: "off",
          contextmenu: false,
          padding: { top: 10, bottom: 8  },
          fontSize: 14,
          automaticLayout: true,
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          quickSuggestions: { other: true, comments: false, strings: false },
        }}
      />
    </div>
  );
}