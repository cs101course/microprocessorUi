import * as React from "react";
import { useEffect, useRef } from "react";
import { Pixel } from "@cs101/microprocessorexamples";

export interface PixelDisplayProps {
  pixels: Array<Pixel>;
  pixelUpdates: number;
  width: number;
  height: number;
  pixelSize?: number;
};

export const PixelDisplayOutput: React.FC<PixelDisplayProps> = ({ pixels, pixelUpdates, width, height, pixelSize = 2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    canvasRef.current.width = width * pixelSize;
    canvasRef.current.height = height * pixelSize;
  }, [width, height]);

  useEffect(() => {
    const context2d = canvasRef.current.getContext('2d');
    context2d.fillStyle = "#ffffff";
    context2d.fillRect(0, 0, width * pixelSize, height * pixelSize);

    for (let i = 0; i < pixels.length; i++) {
      context2d.fillStyle = pixels[i].hexString;
      context2d.fillRect((i % width) * pixelSize, Math.floor(i / width) * pixelSize, pixelSize, pixelSize);
    }
  }, [pixelUpdates]);

  return <canvas className="pixelDisplay" ref={canvasRef} />
};
