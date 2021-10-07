import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Robot } from "@cs101/microprocessorexamples";

import dirt from "./dirt.png";
import grass from "./grass.png";
import robotI from "./robot-i.png";
import robotII from "./robot-ii.png";
import robotIV from "./robot-iv.png";
import switchOff from "./switch-off.png";
import switchOn from "./switch-on.png";

const backgroundImage = new Image();
const robotImage = new Image();
const switchOffImage = new Image();
const switchOnImage = new Image();
switchOffImage.src = switchOff;
switchOnImage.src = switchOn;

export interface World {
  switches: Array<{ row: number, col: number, state: boolean }>;
}
interface RobotImageData {
  src: string;
  scale: number;
  backgroundSrc: string;
  offsetX: number;
  offsetY: number;
  gridColor: string;
  pathColor: string;
}

const robotImages: Record<string, RobotImageData> = {
  "Robot I": {
    src: robotI,
    scale: 1.0,
    backgroundSrc: dirt,
    offsetX: 0,
    offsetY: 0,
    gridColor: "#282",
    pathColor: "#272",
  },
  "Robot II": {
    src: robotII,
    scale: 1.0,
    backgroundSrc: dirt,
    offsetX: 4,
    offsetY: -11,
    gridColor: "#282",
    pathColor: "#272",
  },
  "Robot IV": {
    src: robotIV,
    scale: 0.6,
    backgroundSrc: grass,
    offsetX: 15,
    offsetY: 13,
    gridColor: "#fff",
    pathColor: "#eee",
  }
};
interface PixelCoordinate {
  x: number;
  y: number;
}

type UpdateDelegate<T> = (dt: number, state: T) => void;

class Animation<T> {
  isRunning: boolean;
  frameRequest: number | null;
  lastStep?: number;
  update: UpdateDelegate<T>;
  state: T;

  constructor(update: UpdateDelegate<T>, initialState: T) {
    this.isRunning = false;
    this.frameRequest = null;
    this.update = update;
    this.state = initialState;
  }

  setState(state: T) {
    this.state = state;
  }

  play() {
    if (this.isRunning) {
      return;
    }

    const frame = () => {
      this.step();
      this.frameRequest = window.requestAnimationFrame(frame);
    };

    this.lastStep = Date.now();
    this.frameRequest = window.requestAnimationFrame(frame);
  }

  pause() {
    if (this.frameRequest) {
      window.cancelAnimationFrame(this.frameRequest);
    }
    this.frameRequest = null;
    this.isRunning = false;
  }

  step() {
    const now = Date.now();
    const dt = (now - this.lastStep) / 1000;
    this.lastStep = now;
    this.update(dt, this.state);
  }
}

interface RobotAnimationState {
  states: Array<Robot>;
  step: number;
  context?: CanvasRenderingContext2D;
  width: number;
  height: number;
  gridSize: number;
  pan: PixelCoordinate;
  t?: number;
  isMoving: boolean;
  onStepComplete?: () => void;
  robot: string;
  switches: Array<{ row: number, col: number, state: boolean}>;
}

const drawBg = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pan: PixelCoordinate,
  gridSize: number
) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width * gridSize, height * gridSize);

  const screenWidth = width * gridSize;
  const screenHeight = height * gridSize;

  if (backgroundImage.complete) {
    const offsetX = -(pan.x % backgroundImage.width) - backgroundImage.width;
    const offsetY = -(pan.y % backgroundImage.height) - backgroundImage.height;

    const xCover = (screenWidth / backgroundImage.width) + 2;
    const yCover = (screenHeight / backgroundImage.height) + 2;

    let x = 0;
    let y = 0;
    while (y <= yCover * backgroundImage.height) {
      x = 0;
      while (x <= xCover * backgroundImage.width) {
        ctx.drawImage(
          backgroundImage,
          x + offsetX,
          y + offsetY
        );
        x += backgroundImage.width;
      }
      y += backgroundImage.height;
    }
  }
};

const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pan: PixelCoordinate,
  gridSize: number,
  gridColor: string
) => {
  ctx.save();
  ctx.lineWidth = 0.5;

  const rowPanOffset = pan.x % gridSize;
  for (let col = 0; col <= width; col++) {
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(col * gridSize - rowPanOffset, 0);
    ctx.lineTo(col * gridSize - rowPanOffset, height * gridSize);
    ctx.stroke();
  }

  const colPanOffset = pan.y % gridSize;
  for (let row = 0; row <= height; row++) {
    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(0, row * gridSize - colPanOffset);
    ctx.lineTo(width * gridSize, row * gridSize - colPanOffset);
    ctx.stroke();
  }

  ctx.restore();
};

const TAU = Math.PI * 2;
const getRadians = (prevState: Robot, nextState: Robot) => {
  if (!prevState || prevState.direction === nextState.direction) {
    if (nextState.direction === "North") {
      return [TAU * -0.25, TAU * -0.25];
    } else if (nextState.direction === "South") {
      return [TAU * 0.25, TAU * 0.25];
    } else if (nextState.direction === "East") {
      return [0, 0];
    } else if (nextState.direction === "West") {
      return [TAU * 0.5, TAU * 0.5];
    }
  } else if (prevState.direction === "North") {
    if (nextState.direction === "East") {
      return [TAU * -0.25, 0];
    } else if (nextState.direction === "West") {
      return [TAU * 0.75, TAU * 0.5];
    }
  } else if (prevState.direction === "South") {
    if (nextState.direction === "East") {
      return [TAU * 0.25, 0];
    } else if (nextState.direction === "West") {
      return [TAU * 0.25, TAU * 0.5];
    }
  } else if (prevState.direction === "East") {
    if (nextState.direction === "North") {
      return [0, TAU * -0.25];
    } else if (nextState.direction === "South") {
      return [0, TAU * 0.25];
    }
  } else if (prevState.direction === "West") {
    if (nextState.direction === "North") {
      return [TAU * 0.5, TAU * 0.75];
    } else if (nextState.direction === "South") {
      return [TAU * 0.5, TAU * 0.25];
    }
  }

  return [undefined, undefined];
};

const drawPath = (
  ctx: CanvasRenderingContext2D,
  pan: PixelCoordinate,
  path: Array<Robot>,
  t: number,
  gridSize: number,
  pathColor: string
) => {
  ctx.save();
  ctx.translate(-pan.x, -pan.y);

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.setLineDash([gridSize / 4, gridSize / 5]);
  ctx.strokeStyle = pathColor;

  ctx.beginPath();
  path.forEach((robot, index) => {
    if (index !== path.length - 1) {
      const x = robot.column * gridSize + gridSize / 2;
      const y = robot.row * gridSize + gridSize / 2;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    } else if (index > 0) {
      const nextX = robot.column * gridSize;
      const nextY = robot.row * gridSize;
      const prevX = path[index - 1].column * gridSize;
      const prevY = path[index - 1].row * gridSize;

      const x = t * nextX + (1 - t) * prevX;
      const y = t * nextY + (1 - t) * prevY;

      ctx.lineTo(x + gridSize / 2, y + gridSize / 2);
    }
  });
  ctx.stroke();

  ctx.restore();
};

const drawRobot = (
  ctx: CanvasRenderingContext2D,
  pan: PixelCoordinate,
  prevState: Robot,
  nextState: Robot,
  t: number,
  gridSize: number,
  offsetX: number,
  offsetY: number,
  scale: number
) => {
  if (!prevState && !nextState) {
    return;
  }

  let x: number, y: number;
  let theta: number;

  const [prevTheta, nextTheta] = getRadians(prevState, nextState);

  // Calculate
  if (prevState && nextState) {
    const prevX = prevState.column * gridSize;
    const prevY = prevState.row * gridSize;
    const nextX = nextState.column * gridSize;
    const nextY = nextState.row * gridSize;

    x = t * nextX + (1 - t) * prevX;
    y = t * nextY + (1 - t) * prevY;
    theta = t * nextTheta + (1 - t) * prevTheta;
  } else if (nextState) {
    x = nextState.column * gridSize;
    y = nextState.row * gridSize;
    theta = nextTheta;
  }

  // Draw

  ctx.save();
  ctx.translate(-pan.x, -pan.y);
  ctx.translate(x + gridSize / 2, y + gridSize / 2);
  ctx.rotate(theta + TAU * 0.25);

  if (robotImage.complete) {
    ctx.drawImage(robotImage, -robotImage.width / 2 + offsetX, -robotImage.height / 2 + offsetY, robotImage.width * scale, robotImage.height * scale);
  }

  ctx.restore();
};

const drawSwitches = (ctx: CanvasRenderingContext2D, width: number, height: number, pan: PixelCoordinate, switches: Array<{ row: number, col: number, state: boolean}>, gridSize: number) => {
  ctx.save();
  ctx.translate(-pan.x, -pan.y);

  switches.forEach((switchValue) => {
    const image = switchValue.state ? switchOnImage : switchOffImage;
    ctx.drawImage(image, switchValue.col * gridSize - 2, switchValue.row * gridSize - 11, image.width/2, image.height/2);
  });
  
  ctx.restore();
};

const updateWorld = (dt: number, animationState: RobotAnimationState) => {
  const ctx = animationState.context;
  const width = animationState.width;
  const height = animationState.height;
  const gridSize = animationState.gridSize;
  const pan = animationState.pan;
  const prevState = animationState.states[animationState.step - 1];
  const nextState = animationState.states[animationState.step];
  const path = animationState.states.slice(0, animationState.step + 1);
  const robot = animationState.robot;
  const switches = animationState.switches;

  // Update
  let t = animationState.t || 0;

  const delay = 500;
  const speed = 1000 / delay;
  const manhattenDist =
    nextState && prevState
      ? Math.abs(nextState.column - prevState.column) +
        Math.abs(nextState.row - prevState.row)
      : 1;

  if (animationState.isMoving) {
    if (t > 1) {
      t = 1;
      animationState.onStepComplete();
    } else if (t < 1) {
      t += dt * (speed / Math.max(manhattenDist, 1));
    }
    animationState.t = t;
  }

  if (!ctx) {
    return;
  }

  const robotImageData = robotImages[robot];

  robotImage.src = robotImageData.src;
  backgroundImage.src = robotImageData.backgroundSrc;

  ctx.save();
  drawBg(ctx, width, height, pan, gridSize);
  drawGrid(ctx, width, height, pan, gridSize, robotImageData.gridColor);
  drawPath(ctx, pan, path, t, gridSize, robotImageData.pathColor);
  
  if (switches) {
    drawSwitches(ctx, width, height, pan, switches, gridSize);
  }

  drawRobot(
    ctx,
    pan,
    prevState,
    nextState,
    t,
    gridSize,
    robotImageData.offsetX,
    robotImageData.offsetY,
    robotImageData.scale
  );

  ctx.restore();
};

export interface RobotDisplayProps {
  states: Array<Robot>;
  step: number;
  width: number;
  height: number;
  gridSize: number;
  isMoving: boolean;
  onPanChange?: (pan: PixelCoordinate) => void;
  onStepComplete?: () => void;
  onClick: (gridCell: { row: number, col: number }) => void;
  pan?: { x: number; y: number };
  robot: string;
  world?: World;
  initialPan?: { x: number; y: number};
}

const UnmemoRobotDisplay: React.FC<RobotDisplayProps> = ({
  states,
  step,
  width,
  height,
  gridSize = 64,
  pan,
  onPanChange,
  onStepComplete,
  onClick,
  isMoving,
  robot,
  world,
  initialPan
}) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const centrePan = {
    x: -(width / 2) * gridSize + gridSize / 2,
    y: -(height / 2) * gridSize + gridSize / 2,
  };

  // absolute coords
  const [lastDrag, setLastDrag] = useState<PixelCoordinate | null>(null);

  // element relative coords
  const [lastMouse, setLastMouse] = useState<PixelCoordinate | null>(null);

  const [internalPan, setInternalPan] = useState<PixelCoordinate>(initialPan || centrePan);
  
  const switches = world?.switches;
  const panCoord = pan || internalPan;

  const [animation, setAnimation] = useState<Animation<RobotAnimationState>>(
    () => {
      const initialState = {
        states,
        step,
        context: canvasRef.current?.getContext("2d"),
        width,
        height,
        gridSize,
        pan: panCoord,
        onStepComplete,
        isMoving,
        robot,
        switches,
      };

      const animationRunner = new Animation(updateWorld, initialState);

      animationRunner.play();

      return animationRunner;
    }
  );

  useEffect(() => {
    return () => {
      animation.pause();
    };
  }, []);

  useEffect(() => {
    let t = animation.state.t;

    if (states.length <= 1) {
      t = 1;
    } else if (step !== animation.state.step) {
      t = 0;
    }

    animation.setState({
      states,
      step,
      context: canvasRef.current.getContext("2d"),
      width,
      height,
      gridSize,
      pan: panCoord,
      t,
      onStepComplete,
      isMoving,
      robot,
      switches,
    });
  }, [
    canvasRef.current,
    states,
    step,
    width,
    height,
    gridSize,
    panCoord,
    isMoving,
    onStepComplete,
    switches
  ]);

  const updatePan = (x: number, y: number) => {
    if (lastDrag) {
      if (onPanChange) {
        onPanChange({
          x: lastDrag.x - x,
          y: lastDrag.y - y,
        });
      } else {
        setInternalPan({
          x: lastDrag.x - x,
          y: lastDrag.y - y,
        });
      }
    }
  };

  const startPan = (x: number, y: number) => {
    setLastDrag({
      x: panCoord.x + x,
      y: panCoord.y + y,
    });
  };

  const resetPan = () => {
    if (onPanChange) {
      onPanChange(initialPan || centrePan);
    } else {
      setInternalPan(initialPan || centrePan);
    }

    stopPan();
  };

  const stopPan = () => {
    setLastDrag(null);
  };

  useEffect(() => {
    canvasRef.current.width = width * gridSize;
    canvasRef.current.height = height * gridSize;
  }, [width, height]);

  useEffect(() => {
    document.addEventListener("mouseup", stopPan);
    return () => {
      document.removeEventListener("mouseup", stopPan);
    };
  });

  const onTouchStart = (evt: React.TouchEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.touches[0].pageX - currentTargetRect.left;
    const offsetY = evt.touches[0].pageY - currentTargetRect.top;
    startPan(offsetX, offsetY);
    setLastMouse({
      x: offsetX,
      y: offsetY
    });
  };

  const onTouchEnd = (evt: React.TouchEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.touches[0].pageX - currentTargetRect.left;
    const offsetY = evt.touches[0].pageY - currentTargetRect.top;

    const absoluteX = offsetX + panCoord.x;
    const absoluteY = offsetY + panCoord.y;

    if (lastMouse.x === offsetX && lastMouse.y === offsetY) {
      onClick({
        row: Math.floor(absoluteY / gridSize),
        col: Math.floor(absoluteX / gridSize)
      });
    }
    stopPan();
  };

  const onTouchMove = (evt: React.TouchEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.touches[0].pageX - currentTargetRect.left;
    const offsetY = evt.touches[0].pageY - currentTargetRect.top;
    updatePan(offsetX, offsetY);
  };

  const onMouseDown = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.pageX - currentTargetRect.left;
    const offsetY = evt.pageY - currentTargetRect.top;
    startPan(offsetX, offsetY);
    setLastMouse({
      x: offsetX,
      y: offsetY
    });
  };

  const onMouseUp = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.pageX - currentTargetRect.left;
    const offsetY = evt.pageY - currentTargetRect.top;

    const absoluteX = offsetX + panCoord.x;
    const absoluteY = offsetY + panCoord.y;

    if (lastMouse.x === offsetX && lastMouse.y === offsetY) {
      onClick({
        row: Math.floor(absoluteY / gridSize),
        col: Math.floor(absoluteX / gridSize)
      });
    }
    stopPan();
  }

  const onMouseMove = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.pageX - currentTargetRect.left;
    const offsetY = evt.pageY - currentTargetRect.top;
    updatePan(offsetX, offsetY);
  };

  return (
    <div className="robotContainer">
      <div className="robotDragLabel">Drag to move the map:</div>
      <canvas
        className="robotDisplay"
        ref={canvasRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      />
      <div className="robotToolbar">
        <button type="button" className="button" onClick={resetPan}>
          Reset View
        </button>
      </div>
    </div>
  );
};

export const RobotDisplay = React.memo(UnmemoRobotDisplay);
