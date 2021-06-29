import { Lcd, LcdPeripheral } from "@cs101/microprocessor/dist/peripherals/lcd";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Processor } from "@cs101/microprocessor/dist/types";

const lcd = new LcdPeripheral();

export const processor: Processor<Lcd> = {
  name: "Prototype 4-bit Microprocessor II",
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
      description: "Increment R (R = R + 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        State.setRegister(ps, "R", r + 1);
      },
      ipIncrement: 1
    },
    {
      description: "Decrement R (R = R - 1)",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        State.setRegister(ps, "R", r - 1);
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
