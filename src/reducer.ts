
import { ProcessorState, Processor } from "@cs101/microprocessor";

import { Processor as P, ProcessorState as PS } from "@cs101/microprocessor/dist/types";
import { playSound } from "./audio";
import { SupportedPeripherals, supportsAudio } from "./types";

export interface Action {
  name: "step" | "reset" | "setRegister" | "setMemoryAddress" | "setProgram";
  register?: string;
  address?: number;
  value?: number;
  program?: Array<number>;
  steps?: number;
  processor?: P<SupportedPeripherals>
}

export const newProcessorState = (processor: P<SupportedPeripherals>) => ({
  processor,
  state: ProcessorState.newState(processor)
});

export const reduceState = (state: PS<SupportedPeripherals>, action: Action | string) => {
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
    } else if (supportsAudio(state)) {
      const audioLength = state.state.peripherals.audioBuffer.length;
      Processor.step(ps);
      if (audioLength !== state.state.peripherals.audioBuffer.length) {
        playSound(state.state.peripherals.audioBuffer[state.state.peripherals.audioBuffer.length - 1]);
      }
    } else {
      Processor.step(ps);
    }
  } else if (action.name === "reset") {
    if (action.processor) {
      const newPs = newProcessorState(action.processor);

      ps.processor = newPs.processor;
      ps.state = newPs.state;
    } else {
      ProcessorState.reset(ps);
    }
  } else if (action.name === "setRegister") {
    ProcessorState.setRegister(ps, action.register, action.value);
  } else if (action.name === "setMemoryAddress") {
    ProcessorState.setMemoryAddress(ps, action.address, action.value);
  } else if (action.name === "setProgram") {
    ProcessorState.reset(ps);
    ProcessorState.setMemory(ps, action.program);
  } else if (action.name === "next") {
    do {
      const audioLength = supportsAudio(state) ? state.state.peripherals.audioBuffer.length : 0;
      Processor.step(ps);
      if (supportsAudio(state) && audioLength !== state.state.peripherals.audioBuffer.length) {
        playSound(state.state.peripherals.audioBuffer[state.state.peripherals.audioBuffer.length - 1]);
      }
    } while (ps.state.pipelineStep !== 0);
  }

  return { ...ps };
};
