import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

import * as Tone from "tone";

import "./style.css";

import { maybeSynth, LSystem, drawCanvasLine } from "./utils";
import CanvasManager from "./CanvasManager";

const C_MAJOR = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

const DIMENSION = 600;

// transcribed from https://en.wikipedia.org/wiki/Twinkle,_Twinkle,_Little_Star
const TWINKLE_TWINKLE_LITTLE_STAR =
  `Q Q ++++ Q Q     + Q Q - H  - Q Q - Q Q    - Q Q - H
  ++++ Q Q - Q Q - Q Q - H +++ Q Q - Q Q - Q Q - H
  - Q Q ++++ Q Q     + Q Q - H  - Q Q - Q Q    - Q Q - H
  `
    .replace(/[ \n]/g, "")
    .split("");

type TwinkleRenderState = {
  currentX: number;
  currentY: number;
  currentAngle: number;
  currentNote: number;
};

const TWINKLE_PSEUDO_L_SYSTEM: LSystem<TwinkleRenderState> = {
  initialState: TWINKLE_TWINKLE_LITTLE_STAR,
  rules: function (ch: string): string[] {
    return [ch];
  },
  expansionLimit: 0,
  description: undefined,
  createRenderState: function (dimension: number): TwinkleRenderState {
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
    renderState: TwinkleRenderState,
    scale: Tone.Unit.Frequency[]
  ): TwinkleRenderState {
    let { currentX, currentY, currentAngle, currentNote } = renderState;
    switch (move) {
      case "Q": {
        let oldX = currentX;
        let oldY = currentY;

        currentX += 25 * Math.cos(currentAngle);
        currentY += 25 * Math.sin(currentAngle);

        drawCanvasLine(ctx, { x: oldX, y: oldY }, { x: currentX, y: currentY });

        break;
      }
      case "H": {
        let oldX = currentX;
        let oldY = currentY;

        currentX += 50 * Math.cos(currentAngle);
        currentY += 50 * Math.sin(currentAngle);

        drawCanvasLine(ctx, { x: oldX, y: oldY }, { x: currentX, y: currentY });

        break;
      }
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
    renderState: TwinkleRenderState,
    scale: Tone.Unit.Frequency[]
  ): void {
    const now = Tone.now();
    switch (move) {
      case "Q":
        synth.triggerAttackRelease(scale[renderState.currentNote], "8n", now);
        break;
      case "H":
        synth.triggerAttackRelease(scale[renderState.currentNote], "4n", now);
        break;
      case "+":
      case "-":
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
        case "Q":
          timeout = setTimeout(
            () => setCurrentStroke(currentStroke + 1),
            1000 / beatsPerSecond
          );
          break;
        case "H":
          timeout = setTimeout(
            () => setCurrentStroke(currentStroke + 1),
            (1000 / beatsPerSecond) * 2
          );
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
        <p class="control-string-box">
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
        musicalScale={C_MAJOR}
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
