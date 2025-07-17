import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

import * as Tone from "tone";

import "./style.css";
import { DragonCurve } from "./l-systems/DragonCurve";
import { SierpinskiTriangle } from "./l-systems/SierpinskiTriangle";
import { maybeSynth, LSystem } from "./utils";
import { FriendlyFern } from "./l-systems/FriendlyFern";
import CanvasManager from "./CanvasManager";
import { SierpinskiArrowhead } from "./l-systems/SierpinksiArrowhead";
import { HilbertCurve } from "./l-systems/HilbertCurve";

const DIMENSION = 600;

const L_SYSTEMS: { name: string; system: LSystem<any> }[] = [
  { name: "Dragon Curve", system: DragonCurve },
  { name: "Sierpinski Triangle", system: SierpinskiTriangle },
  { name: "Sierpinksi Arrowhead", system: SierpinskiArrowhead },
  { name: "Friendly Fern", system: FriendlyFern },
  { name: "Hilbert Curve", system: HilbertCurve },
];

export function App() {
  const [iterations, setIterations] = useState(0);

  const [curveColor, setCurveColor] = useState("#FF0000");
  const [bgColor, setBgColor] = useState("#FCFCFC");

  const [synth, setSynth] = useState<maybeSynth>(null);

  const toggleSynth = (enable: boolean) => {
    if (enable) {
      setSynth(new Tone.PolySynth(Tone.Synth).toDestination());
    } else {
      setSynth(null);
    }
  };

  const [currentStroke, setCurrentStroke] = useState(0);
  const [updateFrequency, setUpdateFrequency] = useState(4);

  const [selectedSystem, setSelectedSystem] = useState(0);

  const controlString = useMemo(() => {
    let state: string[] = L_SYSTEMS[selectedSystem].system.initialState;

    for (let i = 0; i < iterations; i++) {
      state = state.flatMap(L_SYSTEMS[selectedSystem].system.rules);
    }

    return state;
  }, [iterations, selectedSystem]);

  useEffect(() => {
    let timeout = null;

    if (currentStroke < controlString.length) {
      timeout = setTimeout(
        () => setCurrentStroke(currentStroke + 1),
        1000 / updateFrequency
      );
    }

    return () => clearTimeout(timeout);
  }, [currentStroke, iterations, selectedSystem]);

  const setIterationsClamped = (newIterations: number) => {
    if (newIterations <= L_SYSTEMS[selectedSystem].system.expansionLimit) {
      setIterations(newIterations);
    }
    setCurrentStroke(0);
  };

  return (
    <div class="grid-2">
      <div class="content-box">
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
      <div class="content-box">
        <label for="lsystem">L-System: </label>
        <select
          id="lsystem"
          onChange={(e) => {
            setSelectedSystem(Number(e.currentTarget.value));
            setIterations(0);
            setCurrentStroke(0);
          }}
        >
          {L_SYSTEMS.map(({ name }, i) => (
            <option value={i} key={i}>
              {name}
            </option>
          ))}
        </select>
        {" | "}
        {Math.min(currentStroke, controlString.length)}/{controlString.length}{" "}
        moves completed
        <hr></hr>
        <label for="iterations">Iterations: </label>
        <input
          id="iterations"
          type="number"
          value={iterations}
          onInput={(e) => setIterationsClamped(Number(e.currentTarget.value))}
          style="width: 5ch;"
        ></input>{" "}
        <button onClick={() => setIterationsClamped(iterations + 1)}>
          Expand Once
        </button>{" "}
        <button onClick={() => setCurrentStroke(controlString.length + 1)}>
          Skip to End
        </button>{" "}
        <button
          onClick={() => {
            setIterations(0);
            setCurrentStroke(0);
          }}
        >
          Reset
        </button>{" "}
        <label for="freq">Frequency (Hz): </label>
        <input
          id="freq"
          type="number"
          value={updateFrequency}
          onInput={(e) => setUpdateFrequency(Number(e.currentTarget.value))}
          style="width: 5ch;"
        ></input>{" "}
        <hr></hr>
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
          checked={synth !== null}
          onInput={(e) => toggleSynth(e.currentTarget.checked)}
        ></input>
      </div>
      <div className="text-center">
        <CanvasManager
          currentSystem={L_SYSTEMS[selectedSystem].system}
          moves={controlString}
          synth={synth}
          currentStroke={currentStroke}
          canvasParameters={{ curveColor, bgColor, canvasDimension: DIMENSION }}
        ></CanvasManager>
      </div>
      <div class="content-box">
        {L_SYSTEMS[selectedSystem].system.description}
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
