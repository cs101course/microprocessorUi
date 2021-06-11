import "react";
import { useState } from "react";

import { Processor, assemble } from "@cs101/microprocessor";
import { processor } from "@cs101/microprocessor/dist/processors/proc8102";
import * as React from "react";

type TextChangeHandler = (text: string) => void;

interface CodeInputProps {
  text: string;
  onChange: TextChangeHandler;
}
const CodeInput: React.FC<CodeInputProps> = ({ text, onChange }) => <textarea value={text} onChange={(evt) => onChange(evt.currentTarget.value)}></textarea>

export const App = () => {
  const [code, setCode] = useState("");
  const onAssembleClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const instructions = assemble(processor, code);
    console.log(instructions);
  }


  return <div>
    <div>
      <CodeInput text={code} onChange={(text: string) => setCode(text)} />
    </div>
    <button type="button" onClick={onAssembleClick}>Assemble</button>
  </div>;
};
