import { Peripheral } from "@cs101/microprocessor/dist/types";

export type Robot = {
  row: number;
  column: number;
  direction: "North" | "South" | "East" | "West";
}

export type RobotJourney = {
  robotStates: Array<Robot>;
  numRobotSteps: number;
}

export class RobotPeripheral implements Peripheral<RobotJourney> {
  reset(state: RobotJourney) {
    state.robotStates = [{
      row: 0,
      column: 0,
      direction: "North"
    }];
    state.numRobotSteps = 0;
  }

  move(state: RobotJourney, value: number) {
    const lastState = state.robotStates[state.numRobotSteps];

    const newState = {
      row: lastState.row,
      column: lastState.column,
      direction: lastState.direction
    };

    if (newState.direction === "North") {
      newState.row -= value;
    } else if (newState.direction === "South") {
      newState.row += value;
    } else if (newState.direction === "East") {
      newState.column += value;
    } else if (newState.direction === "West") {
      newState.column -= value;
    }

    state.robotStates.push(newState);
    state.numRobotSteps++;
  }

  turnLeft(state: RobotJourney) {
    const lastState = state.robotStates[state.numRobotSteps];

    const newState = {
      row: lastState.row,
      column: lastState.column,
      direction: lastState.direction
    };

    if (newState.direction === "North") {
      newState.direction = "West";
    } else if (newState.direction === "South") {
      newState.direction = "East";
    } else if (newState.direction === "East") {
      newState.direction = "North";
    } else if (newState.direction === "West") {
      newState.direction = "South";
    }
    
    state.robotStates.push(newState);
    state.numRobotSteps++;
  }

  turnRight(state: RobotJourney) {
    const lastState = state.robotStates[state.numRobotSteps];

    const newState = {
      row: lastState.row,
      column: lastState.column,
      direction: lastState.direction
    };

    if (newState.direction === "North") {
      newState.direction = "East";
    } else if (newState.direction === "South") {
      newState.direction = "West";
    } else if (newState.direction === "East") {
      newState.direction = "South";
    } else if (newState.direction === "West") {
      newState.direction = "North";
    }
    
    state.robotStates.push(newState);
    state.numRobotSteps++;
  }
}
