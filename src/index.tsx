import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

import p5 from "p5";

import "./style.css";
import P5Canvas from "./P5Canvas";
import { DragonCurve } from "./DragonCurve";
import { SierpinskiTriangle } from "./SierpinskiTriangle";
import { LSystem } from "./utils";

type P5CanvasParameters = {
  strokeWidth: number;
  curveColor: string;
  bgColor: string;
  canvasDimension: number;
};

const DIMENSION = 600;

const L_SYSTEMS: LSystem<any>[] = [DragonCurve, SierpinskiTriangle];

export function App() {
  const [iterations, setIterations] = useState(0);
  const [enableSound, setEnableSound] = useState(false);
  const [skipToEnd, setSkipToEnd] = useState(false);

  const [strokeWidth, setStrokeWidth] = useState(1);
  const [curveColor, setCurveColor] = useState("#FF0000");
  const [bgColor, setBgColor] = useState("#FCFCFC");

  const [currentStroke, setCurrentStroke] = useState(0);

  const [selectedSystem, setSelectedSystem] = useState(0);

  const controlString = useMemo(() => {
    let state: string[] = L_SYSTEMS[selectedSystem].initialState;

    for (let i = 0; i < iterations; i++) {
      state = state.flatMap(L_SYSTEMS[selectedSystem].rules);
    }

    return state;
  }, [iterations, selectedSystem]);

  useEffect(() => {
    let timeout = null;

    if (skipToEnd && currentStroke !== controlString.length + 1) {
      setCurrentStroke(controlString.length + 1);
    } else if (currentStroke < controlString.length) {
      timeout = setTimeout(() => setCurrentStroke(currentStroke + 1), 250);
    }

    return () => clearTimeout(timeout);
  }, [currentStroke, iterations, skipToEnd, selectedSystem]);

  const setIterationsClamped = (newIterations: number) => {
    if (newIterations <= L_SYSTEMS[selectedSystem].expansionLimit) {
      setIterations(newIterations);
    }
    setCurrentStroke(0);
  };

  return (
    <div class="grid-2">
      <div style="padding-right: 1em;">
        <p class="control-string-box">
          String:{" "}
          {controlString.map((ch, idx) => (
            <span
              key={idx}
              className={currentStroke === idx ? "highlighted" : ""}
            >
              {ch}
            </span>
          ))}
        </p>
      </div>
      <div>
        <label for="iterations">Iterations: </label>
        <input
          id="iterations"
          type="number"
          value={iterations}
          onInput={(e) => setIterationsClamped(Number(e.currentTarget.value))}
        ></input>{" "}
        <button onClick={() => setIterationsClamped(iterations + 1)}>
          Expand Once
        </button>{" "}
        <button
          onClick={() => {
            setIterations(0);
            setCurrentStroke(0);
          }}
        >
          Reset
        </button>{" "}
        | {Math.min(currentStroke, controlString.length)}/{controlString.length}{" "}
        moves completed
        <hr></hr>
        <label for="stroke-width">Stroke Width: </label>
        <input
          id="stroke-width"
          type="number"
          value={strokeWidth}
          onInput={(e) => setStrokeWidth(Number(e.currentTarget.value))}
        ></input>{" "}
        <label for="stroke-color">Curve color: </label>
        <input
          id="stroke-color"
          type="color"
          value={curveColor}
          onInput={(e) => setCurveColor(e.currentTarget.value)}
        ></input>{" "}
        <label for="bg-color">Background color: </label>
        <input
          id="bg-color"
          type="color"
          value={bgColor}
          onInput={(e) => setBgColor(e.currentTarget.value)}
        ></input>
        <hr></hr>
        <label for="sound">Enable Sound: </label>
        <input
          id="sound"
          type="checkbox"
          checked={enableSound}
          onInput={(e) => setEnableSound(e.currentTarget.checked)}
        ></input>{" "}
        <label for="skipToEnd">Skip To End: </label>
        <input
          id="skipToEnd"
          type="checkbox"
          checked={skipToEnd}
          onInput={(e) => setSkipToEnd(e.currentTarget.checked)}
        ></input>
        <hr></hr>
        <label for="lsystem">L-System: </label>
        <select
          id="lsystem"
          onChange={(e) => {
            setSelectedSystem(Number(e.currentTarget.value));
						setIterations(0);
            setCurrentStroke(0);
          }}
        >
          <option value="0">Dragon Curve</option>
          <option value="1">Sierpinski Triangle</option>
        </select>
      </div>
      <div className="text-center">
        <P5Canvas
          sketch={p5CanvasManager(
						L_SYSTEMS[selectedSystem],
						controlString,
						enableSound,
						currentStroke,
            {
              strokeWidth,
              curveColor,
              bgColor,
              canvasDimension: DIMENSION,
            }
          )}
        ></P5Canvas>
      </div>
      <div>
        <hr></hr>
        {L_SYSTEMS[selectedSystem].description}
      </div>
    </div>
  );
}

const p5CanvasManager = (
	currentSystem: LSystem<any>,
	moves: string[],
	enableSound: boolean,
	currentStroke: number,
  { strokeWidth, curveColor, bgColor, canvasDimension }: P5CanvasParameters
) => {
  return (p: p5) => {
    p.setup = () => {
      p.createCanvas(canvasDimension, canvasDimension);
      p.background(bgColor);

      p.stroke(curveColor);
      p.strokeWeight(strokeWidth);

      let renderState = currentSystem.createRenderState(canvasDimension);

      for (let i = 0; i < moves.length && i <= currentStroke; i++) {
        if (i === currentStroke) {
          p.stroke("#000000");
        } else {
          p.stroke(curveColor);
        }

        const move = moves[i];

        renderState = currentSystem.updateRenderState(p, move, renderState);

        if (enableSound && i == currentStroke) {
          currentSystem.playSoundFromState(move, renderState);
        }
      }
    };

    p.draw = () => {}; // intentionally left blank
  };
};

render(<App />, document.getElementById("app"));
