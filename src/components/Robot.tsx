import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Robot, RobotJourney } from "../peripherals/robot";

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
    }

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
  states: Array<Robot>,
  step: number,
  context?: CanvasRenderingContext2D;
  width: number;
  height: number;
  gridSize: number;
  pan: PixelCoordinate;
  t?: number;
  isMoving: boolean;
  onStepComplete?: () => void;
}

const drawBg = (ctx: CanvasRenderingContext2D, width: number, height: number, gridSize: number) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width * gridSize, height * gridSize);
};

const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, pan: PixelCoordinate, gridSize: number) => {
  ctx.save();
  ctx.lineWidth = 0.5;

  const rowPanOffset = pan.x % gridSize;
  for (let row = 0; row <= height; row++) {
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(row * gridSize - rowPanOffset, 0);
    ctx.lineTo(row * gridSize - rowPanOffset, height * gridSize);
    ctx.stroke();
  }

  const colPanOffset = pan.y % gridSize;
  for (let col = 0; col <= width; col++) {
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(0, col * gridSize - colPanOffset);
    ctx.lineTo(width * gridSize, col * gridSize - colPanOffset);
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

const drawPath = (ctx: CanvasRenderingContext2D, pan: PixelCoordinate, path: Array<Robot>, t: number, gridSize: number) => {
  ctx.save();
  ctx.translate(-pan.x, -pan.y);

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.setLineDash([gridSize / 4, gridSize / 5]);
  ctx.strokeStyle = "#888";

  ctx.beginPath();
  path.forEach((robot, index) => {
    if (index !== path.length - 1) {
      const x = robot.column * gridSize + gridSize / 2;
      const y = robot.row * gridSize + gridSize / 2;
      
      if (index === 0) {
        ctx.moveTo(x ,y);
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

const drawRobot = (ctx: CanvasRenderingContext2D, pan: PixelCoordinate, prevState: Robot, nextState: Robot, t:number, gridSize: number) => {
  if (!prevState && !nextState) {
    return;
  }

  const robotWidth = gridSize * 0.8;

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
  ctx.translate(x + gridSize/2, y + gridSize/2);
  ctx.rotate(theta + TAU * 0.25);
  
  // body
  ctx.fillStyle = "#39a78e";
  ctx.fillRect(-robotWidth/2, -robotWidth/2, robotWidth, robotWidth);
  
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "black";
  ctx.strokeRect(-robotWidth/2, -robotWidth/2, robotWidth, robotWidth);

  // tracks
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  const offset = (gridSize - robotWidth) / 4;
  ctx.moveTo(-robotWidth/2 + offset, -robotWidth/2);
  ctx.lineTo(-robotWidth/2 + offset, robotWidth/2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(robotWidth/2 - offset, -robotWidth/2);
  ctx.lineTo(robotWidth/2 - offset, robotWidth/2);
  ctx.stroke();

  // direction indicator
  ctx.lineWidth = 0.5;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(-gridSize*0.2, -robotWidth/2 + gridSize * 0.2);
  ctx.lineTo(0, -robotWidth/2);
  ctx.lineTo(gridSize*0.2, -robotWidth/2 + gridSize * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();

};

const updateWorld = (dt: number, animationState: RobotAnimationState) => {
  const ctx = animationState.context;
  const width = animationState.width;
  const height = animationState.height;
  const gridSize = animationState.gridSize;
  const pan = animationState.pan;
  const prevState = animationState.states[animationState.step-1];
  const nextState = animationState.states[animationState.step];
  const path = animationState.states.slice(0, animationState.step + 1);

  // Update
  let t = animationState.t || 0;

  const delay = 500;
  const speed = 1000 / delay;
  const manhattenDist = nextState && prevState ? Math.abs(nextState.column - prevState.column) + Math.abs(nextState.row - prevState.row) : 1;

  if (animationState.isMoving) {
    if (t > 1) {
      t = 1;
      animationState.onStepComplete();
    } else if (t < 1) {
      t += dt * (speed/Math.max(manhattenDist, 1));
    }
    animationState.t = t;
  }

  if (!ctx) {
    return;
  }

  ctx.save();
  drawBg(ctx, width, height, gridSize);
  drawGrid(ctx, width, height, pan, gridSize);
  drawPath(ctx, pan, path, t, gridSize);
  drawRobot(ctx, pan, prevState, nextState, t, gridSize);
  ctx.restore();
};

export interface RobotDisplayProps {
  states: Array<Robot>,
  step: number;
  width: number;
  height: number;
  gridSize: number;
  isMoving: boolean;
  onPanChange?: (pan: PixelCoordinate) => void;
  onStepComplete?: () => void;
  pan?: { x: number; y: number };
};

const UnmemoRobotDisplay: React.FC<RobotDisplayProps> = ({ states, step, width, height, gridSize = 64, pan, onPanChange, onStepComplete, isMoving }) => {
  const initialPan = { x: -(width / 2) * gridSize + gridSize/2, y: -(height / 2) * gridSize + gridSize/2 };
  const canvasRef = useRef<HTMLCanvasElement>();
  const [lastDrag, setLastDrag] = useState<PixelCoordinate | null>(null);
  const [internalPan, setInternalPan] = useState<PixelCoordinate>(initialPan);
  
  const panCoord = pan || internalPan;

  const [animation, setAnimation] = useState<Animation<RobotAnimationState>>(
    () => {
      const initialState = {
        states,
        step,
        context: canvasRef.current?.getContext('2d'),
        width,
        height,
        gridSize,
        pan: panCoord,
        onStepComplete,
        isMoving
      };
      
      const animationRunner = new Animation(
        updateWorld, 
        initialState
      );

      animationRunner.play();
      
      return animationRunner;
    }
  );

  useEffect(() => {
    return () => {
      animation.pause();
    }
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
      context: canvasRef.current.getContext('2d'),
      width,
      height,
      gridSize,
      pan: panCoord,
      t,
      onStepComplete,
      isMoving
    });
  }, [canvasRef.current, states, step, width, height, gridSize, panCoord, isMoving, onStepComplete]);

  const updatePan = (x: number, y: number) => {
    if (lastDrag) {
      if (onPanChange) {
        onPanChange({
          x: lastDrag.x - x,
          y: lastDrag.y - y
        });
      } else {
        setInternalPan({
          x: lastDrag.x - x,
          y: lastDrag.y - y
        });
      }
    }
  }

  const startPan = (x: number, y: number) => {
    setLastDrag({
      x: panCoord.x + x,
      y: panCoord.y + y
    });
  }

  const resetPan = () => {
    if (onPanChange) {
      onPanChange(initialPan);
    } else {
      setInternalPan(initialPan);
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
    document.addEventListener('mouseup', stopPan);
    return () => {
      document.removeEventListener('mosueup', stopPan);
    }
  });

  const onTouchStart = (evt: React.TouchEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.touches[0].pageX - currentTargetRect.left;
    const offsetY = evt.touches[0].pageY - currentTargetRect.top;
    startPan(offsetX, offsetY);
  }

  const onTouchMove = (evt: React.TouchEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.touches[0].pageX - currentTargetRect.left;
    const offsetY = evt.touches[0].pageY - currentTargetRect.top;
    updatePan(offsetX, offsetY);
  }

  const onMouseDown = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.pageX - currentTargetRect.left;
    const offsetY = evt.pageY - currentTargetRect.top;
    startPan(offsetX, offsetY);
  }

  const onMouseMove = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const currentTargetRect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.pageX - currentTargetRect.left;
    const offsetY = evt.pageY - currentTargetRect.top;
    updatePan(offsetX, offsetY);
  }

  return <div className="robotContainer">
    <canvas
      className="robotDisplay"
      ref={canvasRef}
      onTouchStart={onTouchStart}
      onTouchEnd={stopPan}
      onTouchMove={onTouchMove}
      onMouseDown={onMouseDown}
      onMouseUp={stopPan}
      onMouseMove={onMouseMove}
    />
    <div className="robotToolbar">
      <button type="button" onClick={resetPan}>Reset View</button>
    </div>
  </div>
};

export const RobotDisplay = React.memo(UnmemoRobotDisplay);
