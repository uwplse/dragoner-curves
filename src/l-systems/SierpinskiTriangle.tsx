import * as Tone from "tone";
import { drawCanvasLine, LSystem, maybeSynth } from "../utils";

type SierpinskiTriangleRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
};

export const SierpinskiTriangle: LSystem<SierpinskiTriangleRenderState> = {
  initialState: ["X", "-", "Y", "-", "Y"],
  description: <SierpinskiTriangleDescription />,
  rules: (ch: string): string[] => {
    switch (ch) {
      case "X":
        return ["X", "-", "Y", "+", "X", "+", "Y", "-", "X"];
      case "Y":
        return ["Y", "Y"];
      default:
        return [ch];
    }
  },
  expansionLimit: 6,
  createRenderState: (dimension: number): SierpinskiTriangleRenderState => {
    return {
      currentX: (dimension * 9) / 10,
      currentY: (dimension * 9) / 10,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: (
    ctx: CanvasRenderingContext2D,
    move: string,
    renderState: SierpinskiTriangleRenderState,
    scale: Tone.Unit.Frequency[]
  ): SierpinskiTriangleRenderState => {
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
        currentAngle += (Math.PI * 2) / 3;

        currentNote = (currentNote + 1) % scale.length;

        break;
      case "-":
        currentAngle -= (Math.PI * 2) / 3;

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
    renderState: SierpinskiTriangleRenderState,
    scale: Tone.Unit.Frequency[]
  ) => {
    const now = Tone.now();
    switch (move) {
      case "X":
      case "Y":
        synth.triggerAttackRelease(scale[renderState.currentNote], "8n", now);
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

export function SierpinskiTriangleDescription() {
  return (
    <>
      <div>
        Sierpinski Triangle Rules:
        <ul>
          <li>start: X - Y - Y</li>
          <li>
            for every... replace with...
            <ul>
              <li>X &rarr; X - Y + X + Y - X</li>
              <li>Y &rarr; Y Y</li>
            </ul>
          </li>
        </ul>
      </div>
      <div>
        Sierpinski Triangle Symbols:
        <dl>
          <dt>X</dt>
          <dd>visually: go forward by 10 pixels</dd>
          <dd>musically: play transformed note</dd>

          <dt>Y</dt>
          <dd>visually: go forward by 10 pixels</dd>
          <dd>musically: play transformed note</dd>

          <dt>+</dt>
          <dd>visually: turn left by 120 degrees</dd>
          <dd>musically: move note up by 1 whole note</dd>

          <dt>-</dt>
          <dd>visually: turn right by 120 degrees</dd>
          <dd>musically: move note down by 1 whole note</dd>
        </dl>
      </div>
    </>
  );
}
