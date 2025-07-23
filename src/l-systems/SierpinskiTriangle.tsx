import { LSystem } from "../utils";
import {
  SimpleLSystemRenderState,
  simplePlaySoundFromState,
  simpleUpdateStateAndRenderGenerator,
} from "./simple-l-system";
import { AlphabetDescription } from "./AlphabetDescription";

const STEP_SIZE = 10;
const TURN_ANGLE = Math.PI * 2 / 3;

export const SierpinskiTriangle: LSystem<SimpleLSystemRenderState> = {
  name: "Sierpinski Triangle",
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
  maxIterations: 6,
  createRenderState: (dimension: number): SimpleLSystemRenderState => {
    return {
      currentX: (dimension * 9) / 10,
      currentY: (dimension * 9) / 10,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: simpleUpdateStateAndRenderGenerator(STEP_SIZE, TURN_ANGLE),
  playSoundFromState: simplePlaySoundFromState,
};

function SierpinskiTriangleDescription() {
  return (
    <AlphabetDescription
      alphabet={["X", "Y", "+", "-"]}
      name={SierpinskiTriangle.name}
      start={SierpinskiTriangle.initialState}
      rules={[
        ["X", SierpinskiTriangle.rules("X")],
        ["Y", SierpinskiTriangle.rules("Y")],
      ]}
      stepSize={STEP_SIZE}
      turnAngle={TURN_ANGLE}
    />
  );
}
