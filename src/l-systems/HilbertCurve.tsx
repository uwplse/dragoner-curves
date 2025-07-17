import * as Tone from "tone";
import { drawCanvasLine, LSystem, maybeSynth } from "../utils";

type HilbertCurveRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
};

export const HilbertCurve: LSystem<HilbertCurveRenderState> = {
  initialState: ["A"],
  description: <HilbertCurveDescription />,
  rules: (ch: string): string[] => {
    switch (ch) {
      case "A":
        return ["+", "B", "F", "-", "A", "F", "A", "-", "F", "B", "+"];
      case "B":
        return ["-", "A", "F", "+", "B", "F", "B", "+", "F", "A", "-"];
      default:
        return [ch];
    }
  },
  expansionLimit: 12,
  createRenderState: (dimension: number): HilbertCurveRenderState => {
    return {
      currentX: 5,
      currentY: dimension - 5,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: (
    ctx: CanvasRenderingContext2D,
    move: string,
    renderState: HilbertCurveRenderState,
    scale: Tone.Unit.Frequency[]
  ): HilbertCurveRenderState => {
    let { currentX, currentY, currentAngle, currentNote } = renderState;
    switch (move) {
      case "A":
      case "B":
        break;
      case "F":
        let oldX = currentX;
        let oldY = currentY;

        currentX += 5 * Math.cos(currentAngle);
        currentY += 5 * Math.sin(currentAngle);

        drawCanvasLine(ctx, { x: oldX, y: oldY }, { x: currentX, y: currentY });

        break;
      case "+":
        currentAngle += Math.PI / 2;

        currentNote = (currentNote + 1) % scale.length;

        break;
      case "-":
        currentAngle -= Math.PI / 2;

        currentNote = (scale.length + currentNote - 1) % scale.length;

        break;
      default:
        console.error(`Unexpected move ${move}`);
    }

    return { currentX, currentY, currentAngle, currentNote };
  },
  playSoundFromState: (
    synth: maybeSynth,
    move: string,
    renderState: HilbertCurveRenderState,
    scale: Tone.Unit.Frequency[]
  ) => {
    const now = Tone.now();
    switch (move) {
      case "F":
        synth.triggerAttackRelease(scale[renderState.currentNote], "8n", now);
        break;
      case "A":
      case "B":
      case "+":
      case "-":
        break;
      default:
        console.error(`Unexpected move ${move}`);
    }
  },
};

export function HilbertCurveDescription() {
  return (
    <>
      <div>
        Hilbert Curve Rules:
        <ul>
          <li>start: A</li>
          <li>
            for every... replace with...
            <ul>
              <li>A &rarr; +BF-AFA-FB+</li>
              <li>B &rarr; -AF+BFB+FA-</li>
            </ul>
          </li>
        </ul>
      </div>
      <div>
        Hilbert Curve Symbols:
        <dl>
          <dt>F</dt>
          <dd>visually: go forward by 5 pixels</dd>
          <dd>musically: play transformed note</dd>

          <dt>A, B</dt>
          <dd>visually and musically: do nothing</dd>

          <dt>+</dt>
          <dd>visually: turn left by 90 degrees</dd>
          <dd>musically: move F note up by 1 whole note</dd>

          <dt>-</dt>
          <dd>visually: turn right by 90 degrees</dd>
          <dd>musically: move F note down by 1 whole note</dd>
        </dl>
      </div>
    </>
  );
}
