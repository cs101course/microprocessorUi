import * as React from "react";


import { Processor as P } from "@cs101/microprocessor/dist/types";

interface InstructionSetProps<T> {
  processor: P<T>;
}

export const InstructionSet = <T,>({ processor }: InstructionSetProps<T>) => {

  const columns = processor.columns || ["number", "increment", "description"];
  const headers = {
    "number": (key: string) => <th className="isNo" key={key}>Op Code</th>,
    "mnemonic": (key: string) => <th className="isMnem" key={key}>Mnemonic</th>,
    "increment": (key: string) => <th className="isIpInc" key={key}>{processor.memoryBitSize === 4 ? "Nibbles" : "Bytes"}</th>,
    "description": (key: string) => <th className="isDesc" key={key}>Description</th>,
    "code": (key: string) => <th className="isCode" key={key}>C (like) Equivalent</th>
  };
  const rows = {
    "number": (num: string, key: string) => <td key={key}>{num}</td>,
    "mnemonic": (num: string, key: string) => <td key={key}>{processor.instructions[Number(num)].mnemonic}</td>,
    "increment": (num: string, key: string) => <td key={key}>{processor.instructions[Number(num)].ipIncrement}</td>,
    "description": (num: string, key: string) => <td key={key}>{processor.instructions[Number(num)].description}</td>,
    "code": (num: string, key: string) => <td key={key}>{processor.instructions[Number(num)].code || "..."}</td>,
  }

  return <div className="instructionSet">
    <span className="isTitle">Instruction Set:</span>
    <table>
      <thead>
        <tr>
          {columns.map((col, index) => headers[col](index.toString()))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(processor.instructions).map((num: string) => (
          <tr key={num}>
            {columns.map((col, index) => rows[col](num, index.toString()))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
}
