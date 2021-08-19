import * as React from "react";

import { ProcessorState as PS } from "@cs101/microprocessor/dist/types";
import { SupportedPeripherals } from "../types";

import Editor from "react-simple-code-editor";

type TextChangeHandler = (text: string) => void;

interface CodeInputProps {
  ps: PS<SupportedPeripherals>;
  text: string;
  highlight?: [number, number];
  onChange: TextChangeHandler;
}


const isMnemonic = (ps: PS<SupportedPeripherals>, token: string) => {
  return Object.values(ps.processor.instructions).some((value) => value.mnemonic === token);
};

const highlightCode = (ps: PS<SupportedPeripherals>, highlightRowCol?: [number, number]) => (code: string) => {
  const lines = code.split("\n");

  const labels: Record<string, boolean> = {};
  lines.forEach((line: string) => {
    const results = line.matchAll(/(\S+):/g);
    for (let result of results) {
      labels[result[1]] = true;
    }
  });

  if (highlightRowCol) {
    const currLine = lines[highlightRowCol[0]];
    const startIndex = highlightRowCol[1];

    let endIndex = startIndex;
    while (endIndex < currLine.length) {
      if (/\s/.test(currLine.charAt(endIndex))) {
        break;
      }
      endIndex++;
    }

    const prefix = currLine.substring(0, startIndex);
    const highlighted = currLine.substring(startIndex, endIndex);
    const suffix = currLine.substring(endIndex);

    lines[highlightRowCol[0]] = `${prefix}<span class="code-highlight">${highlighted}</span>${suffix}`;
  }

  return lines.map(
    (line: string) => {
      const parts = line.split("//");

      const linePrefix = parts[0]
        .replace(/([\S^<^>]+)/g, (match: string, token: string) => {
          if (token.endsWith(":")) {
            return `<span class="code-label">${token}</span>`;
          } else if (isMnemonic(ps, token)) {
            return `<span class="code-mnemonic">${token}</span>`;
          } else if (labels[token]) {
            return `<span class="code-labelref">${token}</span>`;
          } else {
            return match;
          }
        });

      const lineSuffix = parts.length > 1 ? `<span class="code-comment">//${parts.slice(1).join("//")}</span>` : "";

      return linePrefix + lineSuffix;
    }
  ).join('\n');
};

export const CodeInput: React.FC<CodeInputProps> = ({ ps, text, highlight, onChange }) => {
  const highlightedNodes = highlightCode(ps, highlight);

  const divRef = React.createRef<HTMLDivElement>();
  const editorRef = React.createRef<HTMLDivElement>();

  const onMouseUp = () => {
    if (!divRef.current || !editorRef.current) {
      return;
    }

    if (divRef.current.clientHeight > editorRef.current.clientHeight) {
      divRef.current.style.height = "";
    }
  };

  return <div ref={divRef} className="codeContainer" onMouseUp={onMouseUp}>
    Machine Code Editor:
    <div ref={editorRef}>
      <Editor
        className="code"
        value={text}
        onValueChange={onChange}
        highlight={highlightedNodes}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 16,
        }}
      />
    </div>
  </div>
};
