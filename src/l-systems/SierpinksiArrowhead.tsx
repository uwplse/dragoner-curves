import { LSystem } from "../utils";
import {
  SimpleLSystemRenderState,
  simplePlaySoundFromState,
  simpleUpdateStateAndRenderGenerator,
} from "./simple-l-system";
import { AlphabetDescription } from "./AlphabetDescription";

const STEP_SIZE = 5;
const TURN_ANGLE = Math.PI / 3;

export const SierpinskiArrowhead: LSystem<SimpleLSystemRenderState> = {
  name: "Sierpinski Arrowhead",
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
  maxIterations: 12,
  createRenderState: (dimension: number): SimpleLSystemRenderState => {
    return {
      currentX: dimension / 10,
      currentY: dimension / 2,
      currentAngle: 0,
      currentNote: 0,
    };
  },
  updateStateAndRender: simpleUpdateStateAndRenderGenerator(STEP_SIZE, TURN_ANGLE),
  playSoundFromState: simplePlaySoundFromState,
};

function SierpinskiArrowheadDescription() {
  return (
    <AlphabetDescription
      alphabet={["X", "Y", "+", "-"]}
      name={SierpinskiArrowhead.name}
      start={SierpinskiArrowhead.initialState}
      rules={[
        ["X", SierpinskiArrowhead.rules("X")],
        ["Y", SierpinskiArrowhead.rules("Y")],
      ]}
      stepSize={STEP_SIZE}
      turnAngle={TURN_ANGLE}
    />
  );
}
