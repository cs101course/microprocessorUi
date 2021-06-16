import "react";
import { useEffect, useReducer, useRef, useState } from "react";

import { ProcessorState, assemble, Processor } from "@cs101/microprocessor";
import * as React from "react";
import { Processor as P, ProcessorState as PS } from "@cs101/microprocessor/dist/types";
import { Lcd } from "@cs101/microprocessor/dist/peripherals/lcd";
import { Pixel, PixelDisplay } from "@cs101/microprocessor/dist/peripherals/pixelDisplay";
import { Fire } from "@cs101/microprocessor/dist/peripherals/fire";
import { Speaker } from "@cs101/microprocessor/dist/peripherals/speaker";
import { getSourceMap } from "@cs101/microprocessor/dist/assembler/assembler";

import "./App.css";
type TextChangeHandler = (text: string) => void;


interface Action {
  name: "step" | "reset" | "setRegister" | "setMemoryAddress" | "setProgram";
  register?: string;
  address?: number;
  value?: number;
  program?: Array<number>;
  steps?: number;
}


const measureText = (() => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  return (text: string, font: string) => {
    ctx.font = font;
    return ctx.measureText(text);
  };
})();

interface CodeInputProps {
  text: string;
  highlight?: [number, number];
  onChange: TextChangeHandler;
}
const CodeInput: React.FC<CodeInputProps> = ({ text, highlight, onChange }) => {
  const lineHeight = 18;
  const hPadding = 4;
  const vPadding = 4;
  const font = "16px monospace";
  const charWidth = measureText("X", font).width;
  const cursorWidth = charWidth * 2;
  return <div className="codeContainer">
    {highlight &&
      <div className="highlightBg" style={{ width: cursorWidth + "px", height: lineHeight + "px", top: vPadding + (highlight[0] * lineHeight) + "px", left: (hPadding - 1) + (highlight[1] * charWidth) + "px" }}></div>
    }
    <textarea placeholder="Instructions" className="code" style={{lineHeight, font, paddingLeft: hPadding, paddingTop: vPadding, paddingRight: hPadding, paddingBottom: vPadding}} value={text} onChange={(evt) => onChange(evt.currentTarget.value)}></textarea>
  </div>;
};

interface PixelDisplayProps {
  pixels: Array<Pixel>;
  pixelUpdates: number;
  width: number;
  height: number;
  pixelSize?: number;
};

const PixelDisplayOutput: React.FC<PixelDisplayProps> = ({ pixels, pixelUpdates, width, height, pixelSize=2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    canvasRef.current.width = width * pixelSize;
    canvasRef.current.height = height * pixelSize;
  }, [width, height]);

  useEffect(() => {
    const context2d = canvasRef.current.getContext('2d');
    context2d.fillStyle = "#ffffff";
    context2d.fillRect(0, 0, width * pixelSize, height * pixelSize);
    
    for (let i = 0; i < pixels.length; i++) {
      context2d.fillStyle = pixels[i].hexString;
      context2d.fillRect((i % width) * pixelSize, Math.floor(i / width) * pixelSize, pixelSize, pixelSize);
    }
  }, [pixelUpdates]);

  return <canvas className="pixelDisplay" ref={canvasRef} />
};

type SupportedPeripherals = Lcd & PixelDisplay & Fire & Speaker;

const newProcessorState = (processor: P<SupportedPeripherals>) => ({
  processor,
  state: ProcessorState.newState(processor)
});

const reduceState = (state: PS<SupportedPeripherals>, action: Action | string) => {
  const ps = state;
  if (typeof action === "string") {
    action = {
      name: action as "step" | "reset"
    };
  }

  if (action.name === "step") {

    if (action.steps) {
      for (let i = 0; i < action.steps; i++) {
        Processor.step(ps);
      }
    } else {
      Processor.step(ps);
    }
  } else if (action.name === "reset") {
    ProcessorState.reset(ps);
  } else if (action.name === "setRegister") {
    console.log("set", action.register, action.value);
    ProcessorState.setRegister(ps, action.register, action.value);
    console.log(ps);
  } else if (action.name === "setMemoryAddress") {
    ProcessorState.setMemoryAddress(ps, action.address, action.value);
  } else if (action.name === "setProgram") {
    ProcessorState.reset(ps);
    ProcessorState.setMemory(ps, action.program);
  } else if (action.name === "next") {
    do {
      Processor.step(ps);
    } while (ps.state.pipelineStep !== 0);
  }

  return { ...ps };
};

const statusLabels = [
  "Fetch",
  "Increment",
  "Execute"
];

interface Runtime {
  isRunning: boolean;
}

const start = (step: () => boolean) => {
  const runtime: Runtime = {
    isRunning: true
  };

  const runner = () => {
    if (runtime.isRunning && step()) {
      requestAnimationFrame(runner);
    }
  };
  runner();

  return runtime;
};

const stop = (runtime: Runtime | null): null => {
  if (runtime) {
    runtime.isRunning = false;
  }

  return null;
}

export interface AppProps {
  processor: P<SupportedPeripherals>;
}

export const App = ({
  processor,

}: AppProps) => {
  const [code, setCode] = useState("");
  const [sourceMap, setSourceMap] = useState<Record<number, [number, number]>>({});
  const [runtime, setRuntime] = useState(null);
  const [ps, dispatch] = useReducer(reduceState, {}, () => newProcessorState(processor));

  const onAssembleClick = () => {
    const program = assemble(processor, code);
    setRuntime(stop(runtime));
    setSourceMap(getSourceMap(code));
    dispatch({
      name: "setProgram",
      program
    });
  };

  const onResetClick = () => {
    setRuntime(stop(runtime));
    dispatch("reset");
  };

  const onStepClick = () => {
    setRuntime(stop(runtime));
    dispatch("step");
  };

  const onNextClick = () => {
    setRuntime(stop(runtime));
    dispatch("next");
  };

  const onRunClick = () => {
    if (!runtime) {
      setRuntime(start(
        () => {
          if (ps.state.isHalted) {
            return false;
          }

          dispatch({
            name: "step",
            steps: 256
          });
          return true;
        }
      ));
    } else {
      setRuntime(stop(runtime));
    }
  };

  // clean up
  useEffect(() => {
    return () => stop(runtime);
  }, [runtime]);

  const onRegisterChange = function (evt: React.ChangeEvent<HTMLInputElement>) {
    console.log("Change", this, Number(evt.currentTarget.value));
    dispatch({
      name: "setRegister",
      register: this,
      value: Number(evt.currentTarget.value)
    });
  };

  const onMemoryChange = function (evt: React.ChangeEvent<HTMLInputElement>) {
    console.log("Change addr", this, Number(evt.currentTarget.value));
    dispatch({
      name: "setMemoryAddress",
      address: this,
      value: Number(evt.currentTarget.value)
    });
  };

  const memoryBitClass = `memory${ps.processor.memoryBitSize}bit`;
  const inputSize = Math.log2(ps.processor.memoryBitSize);
  const highlight = sourceMap[ProcessorState.getIp(ps)];

  return <div>
    <div className="toolbar">
      <button type="button" onClick={onAssembleClick}>Upload</button>
      <button type="button" onClick={onStepClick}>Step</button>
      <button type="button" onClick={onNextClick}>Next</button>
      <button type="button" onClick={onRunClick}>{ runtime ? "Stop" : "Run" }</button>
      <button type="button" onClick={onResetClick}>Clear</button>
      <div className="status">
        <div className="stepName">{statusLabels[ps.state.pipelineStep]}</div>
        <div className="cycleNumber">Cycle: <strong>{ps.state.executionStep}</strong></div>
        <div className="haltedStatus">{ps.state.isHalted && "Halted"}</div>
      </div>
    </div>
    <div className="codePanel">
      <CodeInput highlight={highlight} text={code} onChange={(text: string) => { setCode(text); setSourceMap({}); }} />
    </div>
    <div className="underTheHood">
      <div className="memoryPanel">
        <div className={`memory ${memoryBitClass}`}>
          {ps.state.memory
            .filter((_, index) => index < ps.processor.numMemoryAddresses)
            .map((value, address) => (
              <div key={address} className="memoryContainer">
                <label>{address}</label>
                <input size={inputSize} type="text" className="memoryCell" value={value} onChange={onMemoryChange.bind(address)} />
              </div>
            ))
          }
        </div>
      </div>
      <div className="registersPanel">
        <div className="registers">
          {ps.processor.registerNames.map((name: string) => (
            <div key={name} className="registerContainer">
              <label>{name}</label>
              <input size={inputSize} type="text" className="register" value={ps.state.registers[name]} onChange={onRegisterChange.bind(name)} />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="peripherals">
      <textarea className="lcd" placeholder="Output LCD" value={ps.state.peripherals.lcdOutput} readOnly></textarea>
      <div className="sounds">
        {
          ps.state.peripherals.audioBuffer && ps.state.peripherals.audioBuffer.join(" ")
        }
      </div>
      <PixelDisplayOutput width={256} height={256} pixels={ps.state.peripherals.pixels} pixelUpdates={ps.state.peripherals.pixelUpdates} />
    </div>
    <div className="instructionSet">
      <span className="isTitle">Instruction Set:</span>
      <table>
        <thead>
          <tr>
            <th className="isNo">No.</th>
            <th className="isMnem">Mnemonic</th>
            <th className="isIpInc">IP Increment</th>
            <th className="isDesc">Description</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(ps.processor.instructions).map((num: string) => (
            <tr key={num}>
              <td>{num}</td>
              <td>{ps.processor.instructions[Number(num)].mnemonic}</td>
              <td>{ps.processor.instructions[Number(num)].ipIncrement}</td>
              <td>{ps.processor.instructions[Number(num)].description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
};
