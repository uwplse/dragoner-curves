import * as Tone from "tone";
import { drawCanvasLine, maybeSynth } from "../utils";

export type SimpleLSystemRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
};

export const simpleUpdateStateAndRenderGenerator = (stepSize: number, turnAngle: number) => { return (
  ctx: CanvasRenderingContext2D,
  move: string,
  renderState: SimpleLSystemRenderState,
  scale: Tone.Unit.Frequency[]
): SimpleLSystemRenderState => {
  let { currentX, currentY, currentAngle, currentNote } = renderState;

  switch (move) {
    case "A":
    case "B":
      break;
    case "F":
    case "X":
    case "Y":
    case "Z":
      let oldX = currentX;
      let oldY = currentY;

      currentX += stepSize * Math.cos(currentAngle);
      currentY += stepSize * Math.sin(currentAngle);

      drawCanvasLine(ctx, { x: oldX, y: oldY }, { x: currentX, y: currentY });

      break;
    case "+":
      currentAngle += turnAngle;

      currentNote = (currentNote + 1) % scale.length;

      break;
    case "-":
      currentAngle -= turnAngle;

      currentNote = (scale.length + currentNote - 1) % scale.length;

      break;
    default:
      console.error(`Unexpected move ${move}`);
  }

  return { currentX, currentY, currentAngle, currentNote };
}};

export const simplePlaySoundFromState = (
  synth: maybeSynth,
  move: string,
  renderState: SimpleLSystemRenderState,
  scale: Tone.Unit.Frequency[]
) => {
  const now = Tone.now();
  switch (move) {
    case "F":
    case "X":
    case "Y":
      synth.triggerAttackRelease(scale[renderState.currentNote], "8n", now);
      break;
    case "Z":
      synth.triggerAttackRelease(scale[0], "8n", now);
      break;
    case "A":
    case "B":
    case "+":
    case "-":
      break;
    default:
      console.error(`Unexpected move ${move}`);
  }
};
