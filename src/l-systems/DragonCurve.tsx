import * as Tone from "tone";
import { drawCanvasLine, LSystem, maybeSynth } from "../utils";

type DragonCurveRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
};

export const DragonCurve: LSystem<DragonCurveRenderState> = {
  initialState: ["X"],
  description: <DragonCurveDescription />,
  rules: (ch: string): string[] => {
    switch (ch) {
      case "X":
        return ["X", "+", "Y"];
      case "Y":
        return ["X", "-", "Y"];
      default:
        return [ch];
    }
  },
  expansionLimit: 12,
  createRenderState: (dimension: number): DragonCurveRenderState => {
    return {
      currentX: dimension / 2,
      currentY: dimension / 2,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: (
    ctx: CanvasRenderingContext2D,
    move: string,
    renderState: DragonCurveRenderState,
    scale: Tone.Unit.Frequency[]
  ): DragonCurveRenderState => {
    let { currentX, currentY, currentAngle, currentNote } = renderState;
    switch (move) {
      case "X":
      case "Y":
        let oldX = currentX;
        let oldY = currentY;

        currentX += 10 * Math.cos(currentAngle);
        currentY += 10 * Math.sin(currentAngle);

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
    renderState: DragonCurveRenderState,
    scale: Tone.Unit.Frequency[]
  ) => {
    const now = Tone.now();
    switch (move) {
      case "X":
        synth.triggerAttackRelease(scale[renderState.currentNote], "8n", now);
        break;
      case "Y":
        synth.triggerAttackRelease(scale[0], "8n", now);
        break;
      case "+":
      case "-":
        break;
      default:
        console.error(`Unexpected move ${move}`);
    }
  },
};

export function DragonCurveDescription() {
  return (
    <>
      <div>
        Dragon Curve Rules:
        <ul>
          <li>start: X</li>
          <li>
            for every... replace with...
            <ul>
              <li>X &rarr; X + Y</li>
              <li>Y &rarr; X - Y</li>
            </ul>
          </li>
        </ul>
      </div>
      <div>
        Dragon Curve Symbols:
        <dl>
          <dt>X</dt>
          <dd>visually: go forward by 10 pixels</dd>
          <dd>musically: play transformed note</dd>

          <dt>Y</dt>
          <dd>visually: go forward by 10 pixels</dd>
          <dd>musically: play middle C</dd>

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
