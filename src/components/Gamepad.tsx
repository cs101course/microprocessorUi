import * as React from "react";

type Button = "w" | "a" | "s" | "d" | "ArrowUp" | "ArrowLeft" | "ArrowDown" | "ArrowRight";

const isButton = (button: string): button is Button => {
  const buttons: Array<string> = ["w", "a", "s", "d", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];
  return buttons.includes(button);
}

type ButtonHandler = (button: Button) => void;

interface GamePadProps {
  onButtonDown: ButtonHandler;
  onButtonUp: ButtonHandler;
}

const Button = ({ onButtonDown, onButtonUp, button }: {
  onButtonDown: ButtonHandler;
  onButtonUp: ButtonHandler;
  button: Button;
}) => (
  <button
    className={`pad-${button}`}
    type="button"
    onMouseDown={() => onButtonDown(button)}
    onMouseUp={() => onButtonUp(button)}
    onTouchStart={() => onButtonDown(button)}
    onTouchEnd={() => onButtonUp(button)}
  ></button>
)

export const GamePad = ({ onButtonDown, onButtonUp }: GamePadProps) => {
  return <div
    className="gamePad"
    onKeyDown={(evt) => { evt.preventDefault(); isButton(evt.key) && onButtonDown(evt.key) }}
    onKeyUp={(evt) => { evt.preventDefault(); isButton(evt.key) && onButtonUp(evt.key) }}
  >
    <div className="leftPad">
      <Button button="w" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      <Button button="a" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      <Button button="s" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      <Button button="d" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
    </div>
    <div className="rightPad">
      <Button button="ArrowUp" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      <Button button="ArrowLeft" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      <Button button="ArrowDown" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
      <Button button="ArrowRight" onButtonDown={onButtonDown} onButtonUp={onButtonUp} />
    </div>
  </div >
}
