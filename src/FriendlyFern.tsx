import * as Tone from "tone";
import { drawCanvasLine, LSystem, maybeSynth } from "./utils";

const BASE_FREQUENCY = 262; // middle C
const FREQUENCIES = [
  BASE_FREQUENCY,
  (BASE_FREQUENCY * 9) / 8,
  (BASE_FREQUENCY * 5) / 4,
  (BASE_FREQUENCY * 4) / 3,
  (BASE_FREQUENCY * 3) / 2,
  (BASE_FREQUENCY * 5) / 3,
  (BASE_FREQUENCY * 15) / 8,
  BASE_FREQUENCY * 2,
];

type FriendlyFernRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
}[];

const TWENTY_FIVE_DEG_IN_RAD = 25 * Math.PI / 180;

export const FriendlyFern: LSystem<FriendlyFernRenderState> = {
  initialState: ["-", "X"],
  description: <FriendlyFernDescription />,
  rules: (ch: string): string[] => {
    switch (ch) {
      case "X":
        return ["Y", "+", "[", "[", "X", "]", "-", "X", "]", "-", "Y", "[", "-", "Y", "X", "]", "+", "X"];
      case "Y":
        return ["Y", "Y"];
      default:
        return [ch];
    }
  },
  expansionLimit: 6,
  createRenderState: (dimension: number): FriendlyFernRenderState => {
    return [{
      currentX: dimension / 10,
      currentY: dimension * 9 / 10,
      currentAngle: Math.PI / 2,
      currentNote: 0,
    }];
  },
  updateStateAndRender: (
    ctx: CanvasRenderingContext2D,
    move: string,
    renderState: FriendlyFernRenderState
  ): FriendlyFernRenderState => {
    let { currentX, currentY, currentAngle, currentNote } = renderState[0];
    switch (move) {
      case "X":
        break;
      case "Y":
        let oldX = currentX;
        let oldY = currentY;

        currentX += 5 * Math.cos(currentAngle);
        currentY -= 5 * Math.sin(currentAngle); // flipped - graphics vs math origin shenanigans

        drawCanvasLine(ctx, {x: oldX, y: oldY}, {x: currentX, y: currentY});

        break;
      case "+":
        currentAngle += TWENTY_FIVE_DEG_IN_RAD;

        currentNote = (currentNote + 1) % FREQUENCIES.length;

        break;
      case "-":
        currentAngle -= TWENTY_FIVE_DEG_IN_RAD;

        currentNote =
          (FREQUENCIES.length + currentNote - 1) % FREQUENCIES.length;

        break;
      case "[":
        return [{ currentX, currentY, currentAngle, currentNote }].concat(renderState);
      case "]":
        return renderState.slice(1);
      default:
        console.error(`Unexpected move ${move}`);
    }

    return [{ currentX, currentY, currentAngle, currentNote }].concat(renderState.slice(1));
  },
  playSoundFromState: (synth: maybeSynth, move: string, renderState: FriendlyFernRenderState) => {
    const now = Tone.now();
    switch (move) {
      case "X":
        break;
      case "Y":
        synth.triggerAttackRelease(FREQUENCIES[renderState[0].currentNote], "8n", now);
        break;
      case "+":
      case "-":
      case "[":
      case "]":
        break;
      default:
        console.error(`Unexpected move ${move}`);
    }
  },
};

export function FriendlyFernDescription() {
  return (
    <>
      TBD
    </>
  );
}
