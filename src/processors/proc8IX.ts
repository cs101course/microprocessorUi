import { Fire, FirePeripheral } from "@cs101/microprocessor/dist/peripherals/fire";
import { Lcd, LcdPeripheral } from "@cs101/microprocessor/dist/peripherals/lcd";
import { PixelDisplay, PixelDisplayPeripheral } from "@cs101/microprocessor/dist/peripherals/pixelDisplay";
import { Speaker, SpeakerPeripheral } from "@cs101/microprocessor/dist/peripherals/speaker";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Instruction, Processor } from "@cs101/microprocessor/dist/types";

const lcd = new LcdPeripheral();
const speaker = new SpeakerPeripheral();
const pixelDisplay = new PixelDisplayPeripheral();
const fire = new FirePeripheral();

const randByte = () => Math.floor(Math.random() * 256);

type PeripheralType = Lcd & Speaker & PixelDisplay & Fire;

const undocumentedInstructions: Record<string, Instruction<PeripheralType>> = {
  "27-31": {
    description: "Undefined",
    execute: (ps) => {
      State.setMemoryAddress(ps, randByte(), randByte());
    },
    ipIncrement: 1
  },
  "42": {
    description: "Undefined",
    execute: (ps) => {
      const peripherals = State.getPeripherals(ps);
      fire.catchFire(peripherals);
    },
    ipIncrement: 1
  },
  "43-47": {
    description: "Undefined",
    execute: (ps) => {
      const instructions = Object.keys(ps.processor.instructions);
      const randomIndex = Math.floor(Math.random() * instructions.length);
      const randomInstruction = Number(instructions[randomIndex]);
      const instruction = ps.processor.instructions[randomInstruction];
      const extraIncrement = instruction.ipIncrement - 1;
      if (extraIncrement > 0) {
        State.setRegister(ps, "IP", State.getRegister(ps, "IP") + extraIncrement);
      }
      instruction.execute(ps);
    },
    ipIncrement: 1
  },
  "52-63": {
    description: "Undefined",
    execute: (ps) => {
      State.setRegister(ps, "R0", randByte());
    },
    ipIncrement: 1
  },
  "69-255": {
    description: "Undefined",
    execute: (ps) => {
      const peripherals = State.getPeripherals(ps);
      lcd.printString(peripherals, "Error");
    },
    ipIncrement: 1
  }
};

export const processor: Processor<PeripheralType> = {
  name: "8-bit Microprocessor IX",
  memoryBitSize: 8,
  registerBitSize: 8,
  numMemoryAddresses: 256,
  registerNames: ["IP", "IS", "R0", "R1", "SP", "PORT"],
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
    pixelDisplay,
    fire
  ],
  getUndocumentedInstruction: (instruction: number) => {
    let lookup;

    if (instruction >= 27 && instruction <= 31) {
      lookup = "27-31";
    } else if (instruction >= 43 && instruction <= 47) {
      lookup = "43-47";
    } else if (instruction >= 52 && instruction <= 63) {
      lookup = "52-63";
    } else if (instruction >= 69) {
      lookup = "69-255";
    } else {
      lookup = instruction;
    }
    
    const result = undocumentedInstructions[lookup];

    if (result) {
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
    "8": {
      description: "Shift Left",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 << r1);
      },
      ipIncrement: 1,
      mnemonic: "SHL",
      code: "R0 = R0 << R1"
    },
    "9": {
      description: "Shift Right",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 >> r1);
      },
      ipIncrement: 1,
      mnemonic: "SHR",
      code: "R0 = R0 >> R1"
    },
    "10": {
      description: "Bitwise AND",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 & r1);
      },
      ipIncrement: 1,
      mnemonic: "AND",
      code: "R0 = R0 & R1"
    },
    "11": {
      description: "Bitwise OR",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 | r1);
      },
      ipIncrement: 1,
      mnemonic: "OR",
      code: "R0 = R0 | R1"
    },
    "12": {
      description: "Bitwise XOR",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", r0 ^ r1);
      },
      ipIncrement: 1,
      mnemonic: "XOR",
      code: "R0 = R0 ^ R1"
    },
    "13": {
      description: "Bitwise NOT",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        State.setRegister(ps, "R0", ~r0);
      },
      ipIncrement: 1,
      mnemonic: "NOT",
      code: "R0 = ~R0"
    },
    "14": {
      description: "Minimum",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", Math.min(r0, r1));
      },
      ipIncrement: 1,
      mnemonic: "MIN",
      code: "R0 = min(R0, R1)"
    },
    "15": {
      description: "Maximum",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        State.setRegister(ps, "R0", Math.max(r0, r1));
      },
      ipIncrement: 1,
      mnemonic: "MAX",
      code: "R0 = max(R0, R1)"
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
    "23": {
      description: "Load value at address SP+<data> into R0",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, sp + data));
      },
      ipIncrement: 2,
      mnemonic: "LSR0",
      code: "R0 = *(SP + <data>)"
    },
    "24": {
      description: "Load value at address SP+<data> into R1",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setRegister(ps, "R1", State.getMemoryAddress(ps, sp + data));
      },
      ipIncrement: 2,
      mnemonic: "LSR1",
      code: "R1 = *(SP + <data>)"
    },
    "25": {
      description: "Store R0 at address SP+<data>",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setMemoryAddress(ps, sp + data, State.getRegister(ps, "R0"));
      },
      ipIncrement: 2,
      mnemonic: "SSR0",
      code: "*(SP + <data>) = R0"
    },
    "26": {
      description: "Store R1 at address SP+<data>",
      execute: (ps) => {
        const data = State.getArgument(ps);
        const sp = State.getRegister(ps, "SP");
        
        State.setMemoryAddress(ps, sp + data, State.getRegister(ps, "R1"));
      },
      ipIncrement: 2,
      mnemonic: "SSR1",
      code: "*(SP + <data>) = R1"
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
    "36": {
      description: "Jump to address <data> if R0 == R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") === State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JE",
      code: "if (R0 == R1) { IP = <data> }"
    },
    "37": {
      description: "Jump to address <data> if R0 != R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") !== State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JNE",
      code: "if (R0 != R1) { IP = <data> }"
    },
    "38": {
      description: "Jump to address <data> if R0 < R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") < State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JB",
      code: "if (R0 < R1) { IP = <data> }"
    },
    "39": {
      description: "Jump to address <data> if R0 <= R1",
      execute: (ps) => {
        if (State.getRegister(ps, "R0") <= State.getRegister(ps, "R1")) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JBE",
      code: "if (R0 <= R1) { IP = <data> }"
    },
    "40": {
      description: "Jump to address <data> if (PORT & R0) != 0",
      execute: (ps) => {
        if ((State.getRegister(ps, "PORT") & State.getRegister(ps, "R0")) !== 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JNZP",
      code: "if ((PORT & R0) != 0) { IP = <data> }"
    },
    "41": {
      description: "Jump to address <data> if (PORT & R0) == 0",
      execute: (ps) => {
        if ((State.getRegister(ps, "PORT") & State.getRegister(ps, "R0")) === 0) {
          const address = State.getArgument(ps);
          State.setIp(ps, address);
        }
      },
      ipIncrement: 2,
      mnemonic: "JZP",
      code: "if ((PORT & R0) == 0) { IP = <data> }"
    },
    "48": {
      description: "Pop (into R0)",
      execute: (ps) => {
        const sp = State.getRegister(ps, "SP");
        State.setRegister(ps, "R0", State.getMemoryAddress(ps, sp));
        State.setRegister(ps, "SP", sp + 1);
      },
      ipIncrement: 1,
      mnemonic: "POP",
      code: "R0 = *(SP); SP = SP + 1"
    },
    "49": {
      description: "Return (Pop into IP)",
      execute: (ps) => {
        const sp = State.getRegister(ps, "SP");
        State.setIp(ps, State.getMemoryAddress(ps, sp));
        State.setRegister(ps, "SP", sp + 1);
      },
      ipIncrement: 1,
      mnemonic: "RET",
      code: "IP = *(SP); SP = SP + 1;"
    },
    "50": {
      description: "Push R0",
      execute: (ps) => {
        const r0 = State.getRegister(ps, "R0");
        const sp = State.getRegister(ps, "SP") - 1;
        State.setRegister(ps, "SP", sp);
        State.setMemoryAddress(ps, sp, r0);
      },
      ipIncrement: 1,
      mnemonic: "PUSH",
      code: "SP = SP - 1; *(SP) = R0"
    },
    "51": {
      description: "Call function at address <data> (Push IP and Jump)",
      execute: (ps) => {
        const address = State.getArgument(ps);
        const ip = State.getIp(ps);
        const sp = State.getRegister(ps, "SP") - 1;
        State.setRegister(ps, "SP", sp);
        State.setMemoryAddress(ps, sp, ip);
        State.setIp(ps, address);
      },
      ipIncrement: 2,
      mnemonic: "CALL",
      code: "SP = SP - 1; *(SP) = IP; IP = <data>"
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
    },
    "68": {
      description: "Plot pixel <data> at coordinate R0, R1",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        const r0 = State.getRegister(ps, "R0");
        const r1 = State.getRegister(ps, "R1");
        const value = State.getArgument(ps);

        pixelDisplay.plot(peripherals, r0, r1, value);
      },
      ipIncrement: 2,
      mnemonic: "PLOT"
    }
  }
};
