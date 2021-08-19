import * as React from "react";
import { useEffect, useReducer, useState } from "react";

import { ProcessorState, assemble } from "@cs101/microprocessor";

import { Processor as P } from "@cs101/microprocessor/dist/types";
import { getSourceMap } from "@cs101/microprocessor/dist/assembler/assembler";

import "./fonts/LCDDot-TR.ttf";
import "./App.css";

import { playAudioBuffer } from "./audio";
import { InstructionSet } from "./components/InstructionSet";
import {
  SupportedPeripherals,
  supportsAudio,
  supportsLcd,
  supportsPixels,
  supportsRobot,
} from "./types";
import { CodeInput } from "./components/CodeInput";
import { PixelDisplayOutput } from "./components/PixelDisplayOutput";
import { startRunning, stopRunning } from "./runtime";
import { newProcessorState, reduceState } from "./reducer";
import { GamePad } from "./components/Gamepad";
import { RobotDisplay } from "./components/Robot";

const statusLabels = ["Fetch", "Increment", "Execute"];

export interface AppProps {
  processors: Array<P<SupportedPeripherals>>;
}

export const App = ({ processors }: AppProps) => {
  const [processorIndex, setProcessorIndex] = useState(processors.length - 1);
  const [code, setCode] = useState("");
  const [sourceMap, setSourceMap] = useState<Record<number, [number, number]>>(
    {}
  );
  const [runtime, setRuntime] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [ps, dispatch] = useReducer(reduceState, {}, () =>
    newProcessorState(processors[processorIndex])
  );

  const [isRobotRunning, setIsRobotRunning] = useState<boolean>(false);
  const [isRobotMoving, setIsRobotMoving] = useState<boolean>(false);
  const [prevRobotStep, setPrevRobotStep] = useState(0);
  const [robotRunner, setRobotRunner] = useState<NodeJS.Timeout | null>(null);

  const processor = processors[processorIndex];

  const robotStep = supportsRobot(ps) ? ps.state.peripherals.numRobotSteps : 1;

  useEffect(() => {
    if (ps.state.isHalted && runtime) {
      setRuntime(stopRunning(runtime));
    }
  }, [runtime, ps]);

  // clean up
  useEffect(() => {
    return () => stopRunning(runtime);
  }, [runtime]);

  useEffect(() => {
    if (supportsRobot(ps)) {
      if (prevRobotStep !== robotStep) {
        robotRunner && clearTimeout(robotRunner);
        // step added, move robot
        setPrevRobotStep(robotStep);
        setIsRobotMoving(true);
      } else {
        setRobotRunner(
          setTimeout(() => {
            onRobotStepComplete();
          }, 10) as unknown as NodeJS.Timeout
        );
      }
    }
  }, [ps.state.executionStep]);

  const resetRuntime = () => {
    if (!supportsRobot(ps)) {
      setRuntime(stopRunning(runtime));
    } else {
      setPrevRobotStep(0);
      setIsRobotRunning(false);
      setIsRobotMoving(false);
    }
  };

  const onCodeChange = (text: string) => {
    setCode(text);
    setSourceMap({});
  };

  const onAssembleClick = () => {
    resetRuntime();

    try {
      const program = assemble(processor, code);
      const programSourceMap = getSourceMap(code);

      setSourceMap(programSourceMap);
      dispatch({
        name: "setProgram",
        program,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const onResetClick = () => {
    resetRuntime();
    dispatch("reset");
  };

  const onStepClick = () => {
    setRuntime(stopRunning(runtime));
    setIsRobotRunning(false);
    dispatch("step");
  };

  const onNextClick = () => {
    setRuntime(stopRunning(runtime));
    setIsRobotRunning(false);
    dispatch("next");
  };

  const onStopClick = () => {
    setRuntime(stopRunning(runtime));
    setIsRobotRunning(false);
  };

  const onRunRobotClick = () => {
    setIsRobotRunning(true);
    setIsRobotMoving(false);
    dispatch("next");
  };

  const onRobotStepComplete = () => {
    if (supportsRobot(ps)) {
      if (isRobotRunning && !ps.state.isHalted) {
        dispatch("next");
      }
      setIsRobotMoving(false);
    }
  };

  const onRunFastestClick = () => {
    if (!runtime) {
      setRuntime(
        startRunning(() => {
          if (ps.state.isHalted) {
            return false;
          }

          dispatch({
            name: "step",
            steps: 1024,
          });
          return true;
        })
      );
    } else {
      resetRuntime();
    }
  };

  const onRunFastClick = () => {
    if (!runtime) {
      setRuntime(
        startRunning(() => {
          if (ps.state.isHalted) {
            return false;
          }

          dispatch({
            name: "step",
            steps: 512,
          });
          return true;
        })
      );
    } else {
      resetRuntime();
    }
  };

  const onRunClick = () => {
    if (!runtime) {
      setRuntime(
        startRunning(() => {
          if (ps.state.isHalted) {
            return false;
          }

          dispatch("step");
          return true;
        })
      );
    } else {
      resetRuntime();
    }
  };

  const playAudio = () => {
    if (!supportsAudio(ps)) {
      return;
    }

    if (audioPlayer) {
      clearInterval(audioPlayer);
      setAudioPlayer(null);
    } else {
      setAudioPlayer(playAudioBuffer(ps.state.peripherals.audioBuffer));
    }
  };

  const onRegisterChange = function (evt: React.ChangeEvent<HTMLInputElement>) {
    dispatch({
      name: "setRegister",
      register: this,
      value: Number(evt.currentTarget.value),
    });
  };

  const onMemoryChange = function (evt: React.ChangeEvent<HTMLInputElement>) {
    dispatch({
      name: "setMemoryAddress",
      address: this,
      value: Number(evt.currentTarget.value),
    });
  };

  const onProcessorChange = function (
    evt: React.ChangeEvent<HTMLSelectElement>
  ) {
    const index = Number(evt.currentTarget.value);

    setProcessorIndex(index);

    dispatch({
      name: "reset",
      processor: processors[index],
    });
  };

  const keyBits: Record<string, number> = {
    w: 0,
    a: 1,
    s: 2,
    d: 3,
    ArrowUp: 4,
    ArrowLeft: 5,
    ArrowDown: 6,
    ArrowRight: 7,
  };

  const onButtonDown = (button: keyof typeof keyBits) => {
    if (keyBits[button] !== undefined) {
      dispatch({
        name: "setRegister",
        register: "PORT",
        value: ProcessorState.getRegister(ps, "PORT") | (1 << keyBits[button]),
      });
    }
  };

  const onKeyDown = (evt: React.KeyboardEvent<HTMLElement>) => {
    evt.preventDefault();

    if (evt.repeat) {
      return;
    }

    if (keyBits[evt.key] !== undefined) {
      dispatch({
        name: "setRegister",
        register: "PORT",
        value: ProcessorState.getRegister(ps, "PORT") | (1 << keyBits[evt.key]),
      });
    }
  };

  const onKeyUp = (evt: React.KeyboardEvent<HTMLElement>) => {
    if (keyBits[evt.key] !== undefined) {
      dispatch({
        name: "setRegister",
        register: "PORT",
        value:
          ProcessorState.getRegister(ps, "PORT") & ~(1 << keyBits[evt.key]),
      });
    }
  };

  const onButtonUp = (button: keyof typeof keyBits) => {
    if (keyBits[button] !== undefined) {
      dispatch({
        name: "setRegister",
        register: "PORT",
        value: ProcessorState.getRegister(ps, "PORT") & ~(1 << keyBits[button]),
      });
    }
  };

  const memoryBitClass = `memory${ps.processor.memoryBitSize}bit`;
  const microprocessorClass = `micro${ps.processor.memoryBitSize}bit`;
  const inputSize = Math.log2(ps.processor.memoryBitSize);
  const highlight = sourceMap[ProcessorState.getIp(ps)];
  const memoryContainerClass = (address: number) => {
    const classNames = ["memoryContainer"];

    if (ProcessorState.getIp(ps) === address) {
      classNames.push("memoryContainerIp");
    }

    if (
      ps.processor.registerNames.includes("SP") &&
      ProcessorState.getRegister(ps, "SP") === address
    ) {
      classNames.push("memoryContainerSp");
    }

    if (
      ps.processor.registerNames.includes("BP") &&
      ProcessorState.getRegister(ps, "BP") === address
    ) {
      classNames.push("memoryContainerBp");
    }

    return classNames.join(" ");
  };
  const memoryIcons = (address: number) => {
    const icons = [];

    const stack = (key: string) => (
      <i key={key} className="las la-layer-group"></i>
    );
    const ip = (key: string) => (
      <i key={key} className="las la-hand-point-left"></i>
    );
    const bp = (key: string) => <i key={key} className="las la-download"></i>;

    if (ProcessorState.getIp(ps) === address) {
      icons.push(ip);
    }

    if (
      ps.processor.registerNames.includes("SP") &&
      ProcessorState.getRegister(ps, "SP") === address
    ) {
      icons.push(stack);
    }

    if (
      ps.processor.registerNames.includes("BP") &&
      ProcessorState.getRegister(ps, "BP") === address
    ) {
      icons.push(bp);
    }

    if (icons.length !== 0) {
      return <>{icons.map((icon, index) => icon(index.toString()))}</>;
    } else {
      return null;
    }
  };

  return (
    <div>
      <div className="topSection">
        {processors.length > 1 && (
          <div className="chooseProcessor">
            <select onChange={onProcessorChange} value={processorIndex}>
              {processors.map((processor, index) => (
                <option value={index} key={index}>
                  {processor.name || "Untitled"}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="codePanel">
          <CodeInput
            ps={ps}
            highlight={highlight}
            text={code}
            onChange={onCodeChange}
          />
          {error && <div className="errorStatus">{error}</div>}
        </div>
      </div>
      <div className="toolbar">
        <div className="buttons">
          <button type="button" title="Upload" onClick={onAssembleClick}>
            Upload <i className="las la-arrow-down"></i>
          </button>
          {supportsRobot(ps) ? (
            <>
              <button
                type="button"
                onClick={onStepClick}
                title="Step"
                disabled={isRobotRunning || isRobotMoving}
              >
                <span className="toolbarLabel">Step </span>
                <i className="las la-shoe-prints"></i>
              </button>
              <button
                type="button"
                onClick={onNextClick}
                title="Next"
                disabled={isRobotRunning || isRobotMoving}
              >
                <span className="toolbarLabel">Next </span>
                <i className="las la-step-forward"></i>
              </button>
              <button
                type="button"
                onClick={onRunRobotClick}
                title="Run"
                disabled={isRobotRunning || isRobotMoving}
              >
                <span className="toolbarLabel">Run </span>
                <i className="las la-play"></i>
              </button>
              <button
                type="button"
                onClick={onStopClick}
                title="Stop"
                disabled={!isRobotRunning}
              >
                <span className="toolbarLabel">Stop </span>
                <i className="las la-stop"></i>
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onStepClick} title="Step">
                <span className="toolbarLabel">Step </span>
                <i className="las la-shoe-prints"></i>
              </button>
              <button type="button" onClick={onNextClick} title="Next">
                <span className="toolbarLabel">Next </span>
                <i className="las la-step-forward"></i>
              </button>
              <button
                type="button"
                onClick={onRunClick}
                title="Run"
                disabled={runtime}
              >
                <span className="toolbarLabel">Run </span>
                <i className="las la-play"></i>
              </button>
              <button
                type="button"
                onClick={onRunFastClick}
                title="Run Faster"
                disabled={runtime}
              >
                <span className="toolbarLabel">Faster </span>
                <i className="las la-fast-forward"></i>
              </button>
              <button
                type="button"
                onClick={onRunFastestClick}
                title="Run Fastest"
                disabled={runtime}
              >
                <span className="toolbarLabel">Sprint </span>
                <i className="las la-fighter-jet"></i>
              </button>

              <button
                type="button"
                onClick={onStopClick}
                title="Stop"
                disabled={!runtime}
              >
                <span className="toolbarLabel">Stop </span>
                <i className="las la-stop"></i>
              </button>
            </>
          )}

          <button type="button" onClick={onResetClick}>
            <span className="toolbarLabel">Clear </span>
            <i className="las la-backspace"></i>
          </button>

          {ps.processor.registerNames.includes("PORT") && (
            <GamePad onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
          )}
        </div>
      </div>
      <div className={`microprocessor ${microprocessorClass}`}>
        <div className={`underTheHood ${supportsRobot(ps) ? "overlay" : "no-overlay"}`}>
          <div className="status">
            {ps.state.isHalted && <div className="haltedStatus">Halted</div>}
            {!isRobotRunning &&
              !(
                ps.state.executionStep === 0 && ps.state.pipelineStep === 0
              ) && (
                <div className="stepName statusItem">
                  {
                    statusLabels[
                      (ps.state.pipelineStep + statusLabels.length - 1) %
                        statusLabels.length
                    ]
                  }
                </div>
              )}
            <div className="cycleNumber statusItem">
              Cycle: <strong>{ps.state.executionStep}</strong>
            </div>
          </div>
          <div className="registersPanel">
            <span>Registers:</span>
            <div className="registers">
              {ps.processor.registerNames.map((name: string) => (
                <div
                  key={name}
                  className={`registerContainer register-${name}`}
                >
                  <div>
                    <label>{name}</label>
                  </div>
                  <input
                    size={inputSize}
                    type="text"
                    className="register"
                    value={ps.state.registers[name]}
                    onChange={onRegisterChange.bind(name)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="memoryPanel">
            <span>Memory:</span>
            <div className={`memory ${memoryBitClass}`}>
              {ps.state.memory
                .filter((_, index) => index < ps.processor.numMemoryAddresses)
                .map((value, address) => (
                  <div key={address} className={memoryContainerClass(address)}>
                    <div className="memoryIcons">{memoryIcons(address)}</div>
                    <div>
                      <label>{address}</label>
                    </div>
                    <input
                      size={inputSize}
                      type="text"
                      className="memoryCell"
                      value={value}
                      onChange={onMemoryChange.bind(address)}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        {supportsRobot(ps) && (
          <RobotDisplay
            states={ps.state.peripherals.robotStates}
            step={robotStep}
            isMoving={isRobotMoving}
            width={16}
            height={13}
            gridSize={32}
            onStepComplete={onRobotStepComplete}
            robot={processor.name}
          />
        )}
        <div className="peripherals" onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
          {supportsLcd(ps) && (
            <textarea
              className="lcd"
              placeholder="Output LCD"
              value={ps.state.peripherals.lcdOutput}
              readOnly
            ></textarea>
          )}
          {supportsAudio(ps) &&
            ps.state.peripherals.audioBuffer &&
            ps.state.peripherals.audioBuffer.length > 0 && (
              <div className="sounds">
                Audio Buffer:
                <pre>
                  {ps.state.peripherals.audioBuffer &&
                    ps.state.peripherals.audioBuffer.join(" ")}
                </pre>
                <button
                  type="button"
                  className="playAudio button"
                  onClick={playAudio}
                >
                  {audioPlayer === null ? "Play" : "Stop"}
                </button>
              </div>
            )}
          {supportsPixels(ps) && (
            <div className="pixelDisplayContainer">
              {ps.state.peripherals.pixelUpdates > 0 && (
                <PixelDisplayOutput
                  width={256}
                  height={256}
                  pixels={ps.state.peripherals.pixels}
                  pixelUpdates={ps.state.peripherals.pixelUpdates}
                />
              )}
            </div>
          )}
        </div>
        <InstructionSet processor={processor} />
      </div>
    </div>
  );
};
