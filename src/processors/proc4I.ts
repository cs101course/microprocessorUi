import { Lcd, LcdPeripheral } from "@cs101/microprocessor/dist/peripherals/lcd";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Processor } from "@cs101/microprocessor/dist/types";

const lcd = new LcdPeripheral();

export const processor: Processor<Lcd> = {
  name: "Prototype 4-bit Microprocessor I",
  memoryBitSize: 4,
  registerBitSize: 4,
  numMemoryAddresses: 16,
  registerNames: ["IP", "IS", "R"],
  peripherals: [
    lcd
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
      description: "Increase R by 1 (R = R + 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        State.setRegister(ps, "R", r + 1);
      },
      ipIncrement: 1
    },
    {
      description: "Increase R by 2 (R = R + 2)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        State.setRegister(ps, "R", r + 2);
      },
      ipIncrement: 1
    },
    {
      description: "Increase R by 4 (R = R + 4)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        State.setRegister(ps, "R", r + 4);
      },
      ipIncrement: 1
    },
    {
      description: "Increase R by 8 (R = R + 8)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        State.setRegister(ps, "R", r + 8);
      },
      ipIncrement: 1
    },
    {
      description: "N/A",
      execute: (ps) => {},
      ipIncrement: 1
    },
    {
      description: "N/A",
      execute: (ps) => {},
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
