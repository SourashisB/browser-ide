import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor";

type Props = {
  code: string;
  onChange: (newCode: string) => void;
};

const PYTHON_KEYWORDS = [
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class",
  "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global",
  "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
  "return", "try", "while", "with", "yield"
];

const CONTROL_WORDS = [
  "if", "while", "for", "else", "elif", "break", "continue", "return", "try", "except", "finally"
];

const DEF_KEYWORDS = ["def"];

const CodeEditor: React.FC<Props> = ({ code, onChange }) => {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    // Register a custom theme with your colors
    monaco.editor.defineTheme("customPythonTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "defKey", foreground: "00ff00" }, // Green
        { token: "controlKey", foreground: "a259ff" }, // Purple
        { token: "methodCall", foreground: "ffd700" }, // Yellow
        { token: "identifier", foreground: "d4d4d4" }, // Default
      ],
      colors: {},
    });

    // Register a custom Monarch tokenizer for Python
    monaco.languages.setMonarchTokensProvider("python", {
      tokenizer: {
        root: [
          [/\bdef\b/, "defKey"],
          [/\b(if|while|for|else|elif|break|continue|return|try|except|finally)\b/, "controlKey"],
          [/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/, "methodCall"],
          [/#.*$/, "comment"],
          [/'([^'\\]|\\.)*$/, "string.invalid"],
          [/'/, "string", "@string_single"],
          [/"/, "string", "@string_double"],
          [/\b\d+(\.\d+)?\b/, "number"],
          [new RegExp(`\\b(${PYTHON_KEYWORDS.join("|")})\\b`), "keyword"],
          [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],
          [/[{}[\]()]/, "@brackets"],
          [/[<>](?!@symbols)/, "@brackets"],
          [/[=+\-*/%&|^~<>!]=?/, "operator"],
        ],
        string_single: [
          [/[^\\']+/, "string"],
          [/\\./, "string.escape"],
          [/'/, "string", "@pop"]
        ],
        string_double: [
          [/[^\\"]+/, "string"],
          [/\\./, "string.escape"],
          [/"/, "string", "@pop"]
        ]
      }
    });
  }, []);

  return (
    <MonacoEditor
      width="100%"
      height="100%"
      language="python"
      theme="customPythonTheme"
      value={code}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        autoIndent: "full",
        tabSize: 4,
        insertSpaces: true,
        detectIndentation: false,
      }}
    />
  );
};

export default CodeEditor;