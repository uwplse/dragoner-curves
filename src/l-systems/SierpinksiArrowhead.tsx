import * as Tone from "tone";
import { drawCanvasLine, LSystem, maybeSynth } from "../utils";

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

type SierpinskiArrowheadRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
};

export const SierpinskiArrowhead: LSystem<SierpinskiArrowheadRenderState> = {
  initialState: ["X"],
  description: <SierpinskiArrowheadDescription />,
  rules: (ch: string): string[] => {
     switch (ch) {
      case "X":
        return ["Y", "-", "X", "-", "Y"];
      case "Y":
        return ["X", "+", "Y", "+", "X"];
      default:
        return [ch];
    }
  },
  expansionLimit: 12,
  createRenderState: (dimension: number): SierpinskiArrowheadRenderState => {
    return {
      currentX: dimension / 10,
      currentY: dimension / 2,
      currentAngle: 0,
      currentNote: 0,
    };
  },
  updateStateAndRender: (
    ctx: CanvasRenderingContext2D,
    move: string,
    renderState: SierpinskiArrowheadRenderState
  ): SierpinskiArrowheadRenderState => {
    let { currentX, currentY, currentAngle, currentNote } = renderState;
    switch (move) {
      case "X":
      case "Y":
        let oldX = currentX;
        let oldY = currentY;

        currentX += 5 * Math.cos(currentAngle);
        currentY += 5 * Math.sin(currentAngle);

        drawCanvasLine(ctx, {x: oldX, y: oldY}, {x: currentX, y: currentY});

        break;
      case "+":
        currentAngle += Math.PI / 3;

        currentNote = (currentNote + 1) % FREQUENCIES.length;

        break;
      case "-":
        currentAngle -= Math.PI / 3;

        currentNote =
          (FREQUENCIES.length + currentNote - 1) % FREQUENCIES.length;

        break;
      default:
        console.error(`Unexpected move ${move}`);
    }

    return { currentX, currentY, currentAngle, currentNote };
  },
  playSoundFromState: (synth: maybeSynth, move: string, renderState: SierpinskiArrowheadRenderState) => {
    const now = Tone.now();
    switch (move) {
      case "X":
      case "Y":
        synth.triggerAttackRelease(FREQUENCIES[renderState.currentNote], "8n", now);
        break;
      // case "Y":
      //   synth.triggerAttackRelease(BASE_FREQUENCY, "8n", now);
      //   break;
      case "+":
      case "-":
        break;
      default:
        console.error(`Unexpected move ${move}`);
    }
  },
};

export function SierpinskiArrowheadDescription() {
  return (
    <>
      <div>
        Sierpinski Arrowhead Rules:
        <ul>
          <li>start: X</li>
          <li>
            for every... replace with...
            <ul>
              <li>X &rarr; Y - X - Y</li>
              <li>Y &rarr; X - Y - X</li>
            </ul>
          </li>
        </ul>
      </div>
      <div>
        Sierpinski Arrowhead Symbols:
        <dl>
          <dt>X</dt>
          <dd>visually: go forward by 5 pixels</dd>
          <dd>musically: play transformed note</dd>

          <dt>Y</dt>
          <dd>visually: go forward by 5 pixels</dd>
          <dd>musically: play transformed note</dd>

          <dt>+</dt>
          <dd>visually: turn left by 60 degrees</dd>
          <dd>musically: move note up by 1 whole note</dd>

          <dt>-</dt>
          <dd>visually: turn right by 60 degrees</dd>
          <dd>musically: move note down by 1 whole note</dd>
        </dl>
      </div>
    </>
  );
}
