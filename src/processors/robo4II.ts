import { RobotJourney, RobotPeripheral } from "../peripherals/robot";
import { Speaker, SpeakerPeripheral } from "../peripherals/speaker";
import { ProcessorState as State } from "@cs101/microprocessor/dist/state";

import { Processor } from "@cs101/microprocessor/dist/types";

const robot = new RobotPeripheral();
const speaker = new SpeakerPeripheral();

export const processor: Processor<RobotJourney & Speaker> = {
  name: "Prototype 4-Bit Robot II",
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
      description: "Move Forward a distance of R",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        const peripherals = State.getPeripherals(ps);
        
        robot.move(peripherals, r);
      },
      ipIncrement: 1
    },
    {
      description: "Turn Right if R is even, Turn Left otherwise",
      execute: (ps) => {
        const r = State.getRegister(ps, "R");
        const peripherals = State.getPeripherals(ps);
        if (r % 2 === 0) {
          robot.turnRight(peripherals);
        } else {
          robot.turnLeft(peripherals);
        }
      },
      ipIncrement: 1
    },
  ]
};
