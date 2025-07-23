import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import * as Tone from "tone";

import "./style.css";

import { maybeSynth, LSystem, drawCanvasLine } from "./utils";
import CanvasManager from "./CanvasManager";
import { FIXED_C_MAJOR } from "./scales";
import { SimpleLSystemRenderState } from "./l-systems/simple-l-system";

const DIMENSION = 600;

// transcribed from https://en.wikipedia.org/wiki/Twinkle,_Twinkle,_Little_Star
const TWINKLE_TWINKLE_LITTLE_STAR =
  `X X ++++ X X     + X X - X A   - X X - X X    - X X - X A
  ++++ X X - X X - X X - X A  +++ X X - X X - X X - X A
  - X X ++++ X X     + X X - X A   - X X - X X    - X X - X A
  `
    .replace(/[ \n]/g, "")
    .split("");

const TWINKLE_PSEUDO_L_SYSTEM: LSystem<SimpleLSystemRenderState> = {
  name: "Twinkle Twinkle Little Star",
  initialState: TWINKLE_TWINKLE_LITTLE_STAR,
  rules: function (ch: string): string[] {
    return [ch];
  },
  maxIterations: 0,
  defaultOptions: {},
  description: undefined,
  createRenderState: function (dimension: number): SimpleLSystemRenderState {
    return {
      currentX: dimension / 2,
      currentY: dimension - 25,
      currentAngle: -Math.PI / 2,
      currentNote: 0,
    };
  },
  updateStateAndRender: function (
    ctx: CanvasRenderingContext2D,
    move: string,
    renderState: SimpleLSystemRenderState,
    scale: Tone.Unit.Frequency[]
  ): SimpleLSystemRenderState {
    let { currentX, currentY, currentAngle, currentNote } = renderState;
    switch (move) {
      case "X":
      case "A":
        let oldX = currentX;
        let oldY = currentY;

        currentX += 25 * Math.cos(currentAngle);
        currentY += 25 * Math.sin(currentAngle);

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
        break;
    }

    return { currentX, currentY, currentAngle, currentNote };
  },
  playSoundFromState: function (
    synth: maybeSynth,
    move: string,
    renderState: SimpleLSystemRenderState,
    scale: Tone.Unit.Frequency[]
  ): void {
    const now = Tone.now();
    switch (move) {
      case "X":
        synth.triggerAttackRelease(scale[renderState.currentNote], "8n", now);
        break;
      // case "H":
      //   synth.triggerAttackRelease(scale[renderState.currentNote], "4n", now);
      //   break;
      case "+":
      case "-":
      case "A":
        break;
      default:
        break;
    }
  },
};

export function App() {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [beatsPerSecond, setBeatsPerSecond] = useState(112 / 60); // 112 BPM is the "stock" twinkle twinkle little star, ar moderato

  const [synth, setSynth] = useState<maybeSynth>(null);

  const toggleSynth = (enable: boolean) => {
    if (enable) {
      setSynth(new Tone.PolySynth(Tone.Synth).toDestination());
    } else {
      setSynth(null);
    }
  };

  useEffect(() => {
    let timeout = null;

    if (currentStroke < TWINKLE_TWINKLE_LITTLE_STAR.length) {
      const currentMove = TWINKLE_TWINKLE_LITTLE_STAR[currentStroke];
      switch (currentMove) {
        case "+":
        case "-":
          setCurrentStroke(currentStroke + 1);
          return;
        case "X":
        case "A":
          timeout = setTimeout(
            () => setCurrentStroke(currentStroke + 1),
            1000 / beatsPerSecond
          );
          break;
        // case "H":
        //   timeout = setTimeout(
        //     () => setCurrentStroke(currentStroke + 1),
        //     (1000 / beatsPerSecond) * 2
        //   );
      }
    }

    return () => clearTimeout(timeout);
  }, [currentStroke, beatsPerSecond]);

  return (
    <div class="text-center">
      <h1>Twinkle Twinkle Little Star</h1>
      <label for="sound">Enable Sound: </label>
      <input
        id="sound"
        type="checkbox"
        checked={synth !== null}
        onInput={(e) => toggleSynth(e.currentTarget.checked)}
      ></input>
      <button onClick={() => setCurrentStroke(0)}>Restart</button>
      <div class="content-box">
        <p class="control-string-box" style="height: auto;">
          String:{" "}
          {TWINKLE_TWINKLE_LITTLE_STAR.map((ch, idx) => (
            <span
              key={idx}
              className={currentStroke === idx ? "highlighted" : ""}
            >
              {ch}
            </span>
          ))}
        </p>
      </div>
      <CanvasManager
        currentSystem={TWINKLE_PSEUDO_L_SYSTEM}
        musicalScale={FIXED_C_MAJOR}
        moves={TWINKLE_TWINKLE_LITTLE_STAR}
        synth={synth}
        currentStroke={currentStroke}
        canvasParameters={{
          curveColor: "#FF0000",
          bgColor: "#FCFCFC",
          canvasDimension: DIMENSION,
        }}
      ></CanvasManager>
    </div>
  );
}

render(<App />, document.getElementById("app"));
