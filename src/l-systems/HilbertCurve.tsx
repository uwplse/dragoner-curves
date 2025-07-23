import { LSystem } from "../utils";
import {
  SimpleLSystemRenderState,
  simplePlaySoundFromState,
  simpleUpdateStateAndRenderGenerator,
} from "./simple-l-system";
import { AlphabetDescription } from "./AlphabetDescription";

const STEP_SIZE = 5;
const TURN_ANGLE = Math.PI / 2;

export const HilbertCurve: LSystem<SimpleLSystemRenderState> = {
  name: "Hilbert Curve",
  initialState: ["A"],
  description: <HilbertCurveDescription />,
  rules: (ch: string): string[] => {
    switch (ch) {
      case "A":
        return ["+", "B", "X", "-", "A", "X", "A", "-", "X", "B", "+"];
      case "B":
        return ["-", "A", "X", "+", "B", "X", "B", "+", "X", "A", "-"];
      default:
        return [ch];
    }
  },
  maxIterations: 12,
  defaultOptions: {
    iterations: 5,
    updateFrequency: 16,
  },
  createRenderState: (dimension: number): SimpleLSystemRenderState => {
    return {
      currentX: 5,
      currentY: dimension - 5,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: simpleUpdateStateAndRenderGenerator(
    STEP_SIZE,
    TURN_ANGLE
  ),
  playSoundFromState: simplePlaySoundFromState,
};

function HilbertCurveDescription() {
  return (
    <AlphabetDescription
      alphabet={["X", "+", "-", "A", "B"]}
      name={HilbertCurve.name}
      start={HilbertCurve.initialState}
      rules={[
        ["A", HilbertCurve.rules("A")],
        ["B", HilbertCurve.rules("B")],
      ]}
      stepSize={STEP_SIZE}
      turnAngle={TURN_ANGLE}
    />
  );
}
