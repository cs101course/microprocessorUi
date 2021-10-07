import * as React from "react";

import { highlightCode, PS } from "@cs101/microprocessor";
import { SupportedPeripherals } from "@cs101/microprocessorexamples";

import Editor from "react-simple-code-editor";

type TextChangeHandler = (text: string) => void;
type CodeClickHandler = (word: string) => void;

interface CodeInputProps {
  ps: PS<SupportedPeripherals>;
  text: string;
  highlight?: [number, number];
  onChange: TextChangeHandler;
  onClick?: CodeClickHandler;
}

export const CodeInput: React.FC<CodeInputProps> = ({ ps, text, highlight, onChange, onClick }) => {
  const highlightedNodes = highlightCode(ps.processor, highlight);

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

  const onClickWord = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const textArea = evt.target as HTMLTextAreaElement;
    const selectionStart = textArea.selectionStart;
    
    let wordStartIndex = selectionStart-1;
    let wordEndIndex = selectionStart;

    while (wordStartIndex > 0 && text.charAt(wordStartIndex).trim() !== '') {
      wordStartIndex--;
    }

    while (wordEndIndex < text.length && text.charAt(wordEndIndex).trim() !== '') {
      wordEndIndex++;
    }

    const word = text.slice(wordStartIndex, wordEndIndex).trim();
    onClick && onClick(word);
  }

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
        onClick={onClickWord}
      />
    </div>
  </div>
};
