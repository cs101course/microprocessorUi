
export interface Runtime {
  isRunning: boolean;
}

export const startRunning = (step: () => boolean) => {
  const runtime: Runtime = {
    isRunning: true
  };

  const runner = () => {
    if (runtime.isRunning && step()) {
      requestAnimationFrame(runner);
    }
  };
  runner();

  return runtime;
};

export const stopRunning = (runtime: Runtime | null): null => {
  if (runtime) {
    runtime.isRunning = false;
  }

  return null;
};
