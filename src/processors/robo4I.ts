import { RobotJourney, RobotPeripheral } from "../peripherals/robot";
import { Speaker, SpeakerPeripheral } from "../peripherals/speaker";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Processor } from "@cs101/microprocessor/dist/types";

const robot = new RobotPeripheral();
const speaker = new SpeakerPeripheral();

export const processor: Processor<RobotJourney & Speaker> = {
  name: "Prototype 4-Bit Robot I",
  memoryBitSize: 4,
  registerBitSize: 4,
  numMemoryAddresses: 16,
  registerNames: ["IP", "IS", "R"],
  peripherals: [
    robot,
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
      description: "Move Forward",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        robot.move(peripherals, 1);
      },
      ipIncrement: 1
    },
    {
      description: "Turn Right",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        robot.turnRight(peripherals);
      },
      ipIncrement: 1
    },
    {
      description: "Turn Left",
      execute: (ps) => {
        const peripherals = State.getPeripherals(ps);
        robot.turnLeft(peripherals);
      },
      ipIncrement: 1
    }
  ]
};
