import { Lcd } from "@cs101/microprocessor/dist/peripherals/lcd";
import { PixelDisplay } from "@cs101/microprocessor/dist/peripherals/pixelDisplay";
import { Fire } from "@cs101/microprocessor/dist/peripherals/fire";
import { Speaker } from "@cs101/microprocessor/dist/peripherals/speaker";
import { Robot } from "@cs101/microprocessor/dist/peripherals/robot";
import { ProcessorState } from "@cs101/microprocessor/dist/types";

type AudioPeripherals = (Lcd & Fire & Speaker) | (Lcd & Speaker) | (Robot & Speaker) | (Lcd & PixelDisplay & Fire & Speaker);
type LcdPeripherals = (Lcd & Fire & Speaker) | (Lcd & Speaker) | (Lcd & PixelDisplay & Fire & Speaker) | Lcd;
type FirePeripherals = (Lcd & Fire & Speaker) | (Lcd & PixelDisplay & Fire & Speaker);
type PixelPeripherals = (Lcd & PixelDisplay & Fire & Speaker);
type RobotPeripherals = Robot & Speaker;

export type SupportedPeripherals = AudioPeripherals | LcdPeripherals | FirePeripherals | PixelPeripherals | RobotPeripherals

export const supportsAudio = (state: ProcessorState<any>): state is ProcessorState<AudioPeripherals> => {
  return state.state.peripherals.audioBuffer !== undefined;
};

export const supportsLcd = (state: ProcessorState<any>): state is ProcessorState<LcdPeripherals> => {
  return state.state.peripherals.lcdOutput !== undefined;
};

export const supportsFire = (state: ProcessorState<any>): state is ProcessorState<FirePeripherals> => {
  return state.state.peripherals.isOnFire !== undefined;
};

export const supportsPixels = (state: ProcessorState<any>): state is ProcessorState<PixelPeripherals> => {
  return state.state.peripherals.pixels !== undefined;
};

export const supportsRobot = (state: ProcessorState<any>): state is ProcessorState<RobotPeripherals> => {
  return state.state.peripherals.direction !== undefined;
};

