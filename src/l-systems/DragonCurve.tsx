import { LSystem } from "../utils";
import {
  SimpleLSystemRenderState,
  simplePlaySoundFromState,
  simpleUpdateStateAndRenderGenerator,
} from "./simple-l-system";
import { AlphabetDescription } from "./AlphabetDescription";

const STEP_SIZE = 10;
const TURN_ANGLE = Math.PI / 2;

export const DragonCurve: LSystem<SimpleLSystemRenderState> = {
  name: "Dragon Curve",
  initialState: ["X"],
  description: <DragonCurveDescription />,
  rules: (ch: string): string[] => {
    switch (ch) {
      case "X":
        return ["X", "+", "Z"];
      case "Z":
        return ["X", "-", "Z"];
      default:
        return [ch];
    }
  },
  maxIterations: 12,
  defaultOptions: {
    iterations: 1,
    updateFrequency: 8,
  },
  createRenderState: (dimension: number): SimpleLSystemRenderState => {
    return {
      currentX: dimension / 2,
      currentY: dimension / 2,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: simpleUpdateStateAndRenderGenerator(STEP_SIZE, TURN_ANGLE),
  playSoundFromState: simplePlaySoundFromState,
};

function DragonCurveDescription() {
  return (
    <AlphabetDescription
      alphabet={["X", "Z", "+", "-"]}
      name={DragonCurve.name}
      start={DragonCurve.initialState}
      rules={[
        ["X", DragonCurve.rules("X")],
        ["Z", DragonCurve.rules("Z")],
      ]}
      stepSize={STEP_SIZE}
      turnAngle={TURN_ANGLE}
    />
  );
}
