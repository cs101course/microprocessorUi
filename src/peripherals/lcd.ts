import { ProcessorState, Peripheral } from "@cs101/microprocessor/dist/types";

export type Lcd = {
  lcdOutput: string;
}

export class LcdPeripheral implements Peripheral<Lcd> {
  reset(state: Lcd) {
    state.lcdOutput = "";
  }

  printNumber(state: Lcd, value: number) {
    state.lcdOutput += value + "";
  }

  printAscii(state: Lcd, value: number) {
    if (value === 8) {
      state.lcdOutput = state.lcdOutput.slice(0, -1);
    } else if (value === 12) {
      state.lcdOutput = "";
    } else {
      state.lcdOutput += String.fromCharCode(value);
    }
  }

  printString(state: Lcd, value: string) {
    state.lcdOutput += value;
  }
}
