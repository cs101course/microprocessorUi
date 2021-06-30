import { Fire, FirePeripheral } from "../peripherals/fire";
import { Lcd, LcdPeripheral } from "../peripherals/lcd";
import { Speaker, SpeakerPeripheral } from "../peripherals/speaker";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Instruction, Processor } from "@cs101/microprocessor/dist/types";

const lcd = new LcdPeripheral();
const speaker = new SpeakerPeripheral();
const fire = new FirePeripheral();

const randByte = () => Math.floor(Math.random() * 256);

type PeripheralType = Lcd & Speaker & Fire;

const undocumentedInstructions: Record<string, Instruction<PeripheralType>> = {
  "36-63": {
    description: "Undefined",
    execute: (ps) => {
      State.setRegister(ps, "R0", randByte());
    },
    ipIncrement: 1
  },
  "68-255": {
    description: "Undefined",
    execute: (ps) => {
      const peripherals = State.getPeripherals(ps);
      lcd.printString(peripherals, "Error");
    },
    ipIncrement: 1
  }
};

export const processor: Processor<PeripheralType> = {
  name: "8-bit Microprocessor VI",
  memoryBitSize: 8,
  registerBitSize: 8,
  numMemoryAddresses: 256,
  registerNames: ["IP", "IS", "R0", "R1"],
  columns: [
    "number",
    "mnemonic",
    "increment",
    "description",
    "code"
  ],
  peripherals: [
    lcd,
    speaker,
    fire
  ],
  getUndocumentedInstruction: (instruction: number) => {
    let lookup;

    if (instruction >= 36 && instruction <= 63) {
      lookup = "36-63";
    } else if (instruction >= 68) {
      lookup = "68-255";
    } else {
      lookup = instruction;
    }

    const result = undocumentedInstructions[lookup];

    if (result && instruction !== 42) {
      return result;
    } else {
      return {
        description: "Undefined",
        execute: (ps) => {
          const peripherals = State.getPeripherals(ps);
          fire.catchFire(peripherals);
        },
        ipIncrement: 1
      }
    }
  },
  instructions: {
    "0": {
      description: "Halt",
      execute: (ps) => {
        ps.state.isHalted = true;
      },
      ipIncrement: 1,
      mnemonic: "HALT"
    },
    "1": {
      description: "Increment",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r0 + 1);
      },
      ipIncrement: 1,
      mnemonic: "INC",
      code: "R0 = R0 + R1"
    },
    "2": {
      description: "Decrement",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", r0 - 1);
      },
      ipIncrement: 1,
      mnemonic: "DEC",
      code: "R0 = R0 - 1"
    },
    "3": {
      description: "Add",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 + r1);
      },
      ipIncrement: 1,
      mnemonic: "ADD",
      code: "R0 = R0 + R1"
    },
    "4": {
      description: "Subtract",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 - r1);
      },
      ipIncrement: 1,
      mnemonic: "SUB",
      code: "R0 = R0 - R1"
    },
    "5": {
      description: "Multiply",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 * r1);
      },
      ipIncrement: 1,
      mnemonic: "MUL",
      code: "R0 = R0 * R1"
    },
    "6": {
      description: "Integer Divide",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", Math.floor(r0 / r1));
      },
      ipIncrement: 1,
      mnemonic: "DIV",
      code: "R0 = R0 / R1"
    },
    "7": {
      description: "Modulo",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 % r1);
      },
      ipIncrement: 1,
      mnemonic: "MOD",
      code: "R0 = R0 % R1"
    },

    "16": {
      description: "Swap the values of R0, R1",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r1);
        State.setRegister(ps, "R1", r0);
      },
      ipIncrement: 1,
      mnemonic: "SWAP",
      code: "tmp = R0; R0 = R1; R1 = tmp"
    },
    "17": {
      description: "Load (direct) <data> into R0",
      execute: (ps) => {
        const value = State.getArgument(ps);
        State.setRegister(ps, "R0", value);
      },
      ipIncrement: 2,
      mnemonic: "LDR0",
      code: "R0 = <data>"
    },
    "18": {
      description: "Load (direct) <data> into R1",
      execute: (ps) => {
        const value = State.getArgument(ps);
        State.setRegister(ps, "R1", value);
      },
      ipIncrement: 2,
      mnemonic: "LDR1",
      code: "R1 = <data>"
    },
    "19": {
      description: "Load (indirect) value at address <data> into R0",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, address));
      },
      ipIncrement: 2,
      mnemonic: "LIR0",
      code: "R0 = *(<data>)"
    },
    "20": {
      description: "Load (indirect) value at address <data> into R1",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setRegister(ps, "R1", State.getMemoryAddress(ps, address));
      },
      ipIncrement: 2,
      mnemonic: "LIR1",
      code: "R1 = *(<data>)"
    },
    "21": {
      description: "Store R0 into address <data>",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setMemoryAddress(ps, address, State.getRegister(ps, "R0"));
      },
      ipIncrement: 2,
      mnemonic: "SR0",
      code: "*(<data>) = R0"
    },
    "22": {
      description: "Store R1 into address <data>",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setMemoryAddress(ps, address, State.getRegister(ps, "R1"));
      },
      ipIncrement: 2,
      mnemonic: "SR1",
      code: "*(<data>) = R1"
    },
    "32": {
      description: "Dereference R0",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, r0));
      },
      ipIncrement: 1,
      mnemonic: "DR0",
      code: "R0 = *(R0)"
    },
    "33": {
      description: "Jump to address <data>",
      execute: (ps) => {
        const address = State.getArgument(ps);
        State.setIp(ps, address);
      },
      ipIncrement: 2,
      mnemonic: "JMP",
      code: "IP = <data>"
    },
    "34": {
      description: "Jump to address <data> if R0 == 0",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") === 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JZ",
      code: "if (R0 == 0) { IP = <data> }"
    },
    "35": {
      description: "Jump to address <data> if R0 != 0",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") !== 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JNZ",
      code: "if (R0 != 0) { IP = <data> }"
    },

    "64": {
      description: "Print R0 as unsigned integer",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        lcd.printNumber(peripherals, r0);
      },
      ipIncrement: 1,
      mnemonic: "PRINT",
      code: "printf(\"%d\", R0)"
    },
    "65": {
      description: "Print R0 as ASCII character",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        lcd.printAscii(peripherals, r0);
      },
      ipIncrement: 1,
      mnemonic: "PRINTC",
      code: "printf(\"%c\", R0)"
    },
    "67": {
      description: "Play a sound (R0 specifies the sound)",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");

        speaker.sound(peripherals, r0);
      },
      ipIncrement: 1,
      mnemonic: "SOUND"
    }
  }
};
