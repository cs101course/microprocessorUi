import { Lcd, LcdPeripheral } from "@cs101/microprocessor/dist/peripherals/lcd";
import { Speaker, SpeakerPeripheral } from "@cs101/microprocessor/dist/peripherals/speaker";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Processor } from "@cs101/microprocessor/dist/types";

const lcd = new LcdPeripheral();
const speaker = new SpeakerPeripheral();

export const processor: Processor<Lcd & Speaker> = {
  name: "Prototype 4-bit Microprocessor III",
  memoryBitSize: 4,
  registerBitSize: 4,
  numMemoryAddresses: 16,
  registerNames: ["IP", "IS", "R0", "R1"],
  peripherals: [
    lcd,
    speaker
  ],
  instructions: [
    {
      description: "Halt",
      execute: (ps) => {
        ps.state.isHalted = true;
      },
      ipIncrement: 1
    },
    {
      description: "Increment R0 (R0 = R0 + 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r + 1);
      },
      ipIncrement: 1
    },
    {
      description: "Decrement R0 (R0 = R0 - 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r - 1);
      },
      ipIncrement: 1
    },
    {
      description: "Increment R1 (R1 = R1 + 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R1");
        State.setRegister(ps, "R1", r + 1);
      },
      ipIncrement: 1
    },
    {
      description: "Decrement R1 (R1 = R1 - 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R1");
        State.setRegister(ps, "R1", r - 1);
      },
      ipIncrement: 1
    },
    {
      description: "Swap contents of R0 with R1",
      execute: (ps) => {
        const swap = State.getRegister(ps, "R1");
        State.setRegister(ps, "R1", State.getRegister(ps, "R0"));
        State.setRegister(ps, "R0", swap);
      },
      ipIncrement: 1
    },
    {
      description: "Beep",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        speaker.beep(peripherals);
      },
      ipIncrement: 1
    },
    {
      description: "Print the contents of R",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        const peripherals = State.getPeripherals(ps);
        
        lcd.printNumber(peripherals, r);
      },
      ipIncrement: 1
    },
  ]
};
