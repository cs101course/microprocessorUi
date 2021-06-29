import * as React from "react";
import { useEffect, useRef } from "react";
import { Robot } from "@cs101/microprocessor/dist/peripherals/robot";

export interface RobotDisplayProps {
  state: Robot;
  width: number;
  height: number;
  gridSize: number;
};

export const RobotDisplay: React.FC<RobotDisplayProps> = ({ state, width, height, gridSize = 64 }) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    canvasRef.current.width = width * gridSize;
    canvasRef.current.height = height * gridSize;
  }, [width, height]);

  useEffect(() => {
    const context2d = canvasRef.current.getContext('2d');
    context2d.fillStyle = "#ffffff";
    context2d.fillRect(0, 0, width * gridSize, height * gridSize);

  }, [state.column, state.row, state.direction]);

  return <canvas className="robotDisplay" ref={canvasRef} />
};
