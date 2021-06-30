import { Peripheral } from "@cs101/microprocessor/dist/types";

export type Fire = {
  isOnFire: boolean;
};

export class FirePeripheral implements Peripheral<Fire> {
  reset(state: Fire) {
    state.isOnFire = false;
  }

  catchFire(state: Fire) {
    state.isOnFire = true;
  }
};
