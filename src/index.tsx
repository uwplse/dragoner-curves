import { render } from "preact";
import { useEffect, useMemo, useReducer, useState } from "preact/hooks";

import * as Tone from "tone";

import "./style.css";
import { DragonCurve } from "./l-systems/DragonCurve";
import { SierpinskiTriangle } from "./l-systems/SierpinskiTriangle";
import { maybeSynth, LSystem } from "./utils";
import { FriendlyFern } from "./l-systems/FriendlyFern";
import CanvasManager from "./CanvasManager";
import { SierpinskiArrowhead } from "./l-systems/SierpinksiArrowhead";
import { HilbertCurve } from "./l-systems/HilbertCurve";
import { SCALES } from "./scales";

const DIMENSION = 600;

const L_SYSTEMS: { name: string; system: LSystem<any> }[] = [
  { name: "Dragon Curve", system: DragonCurve },
  { name: "Sierpinski Triangle", system: SierpinskiTriangle },
  { name: "Sierpinksi Arrowhead", system: SierpinskiArrowhead },
  { name: "Friendly Fern", system: FriendlyFern },
  { name: "Hilbert Curve", system: HilbertCurve },
];

type Options = {
  iterations: number;

  currentStroke: number;
  updateFrequency: number;

  selectedSystemIndex: number;
  selectedMusicalScaleIndex: number;

  curveColor: string;
  bgColor: string;
};

const initialOptions: Options = {
  iterations: 0,
  currentStroke: 0,
  updateFrequency: 4,
  selectedSystemIndex: 0,
  selectedMusicalScaleIndex: 0,
  curveColor: "#FF0000",
  bgColor: "#FCFCFC",
};

type OptionsActions =
  | { name: "set_bg_color"; color: string }
  | { name: "set_current_stroke"; stroke: number }
  | { name: "set_curve_color"; color: string }
  | { name: "set_iterations_clamped"; iterations: number }
  | { name: "set_selected_musical_scale"; index: number }
  | { name: "set_selected_system"; index: number }
  | { name: "set_update_frequency"; frequency: number };

const optionsReducer = (state: Options, action: OptionsActions): Options => {
  switch (action.name) {
    case "set_bg_color":
      return { ...state, bgColor: action.color };
    case "set_current_stroke":
      return { ...state, currentStroke: action.stroke };
    case "set_curve_color":
      return { ...state, curveColor: action.color };
    case "set_iterations_clamped":
      const max_l_system_iterations =
        L_SYSTEMS[state.selectedSystemIndex].system.expansionLimit;
      if (action.iterations > max_l_system_iterations) {
        return { ...state, iterations: max_l_system_iterations };
      }
      // note: also resets current stroke
      return { ...state, currentStroke: 0, iterations: action.iterations };
    case "set_selected_musical_scale":
      // note: also resets current stroke
      return {
        ...state,
        currentStroke: 0,
        selectedMusicalScaleIndex: action.index,
      };
    case "set_selected_system":
      // TODO: load stuff from the selected system's presets
      return { ...state, currentStroke: 0, selectedSystemIndex: action.index };
    case "set_update_frequency":
      return { ...state, updateFrequency: action.frequency };
    default:
      throw new Error(`Invalid action ${action}`);
  }
};

export function App() {
  const [
    {
      bgColor,
      currentStroke,
      curveColor,
      iterations,
      selectedSystemIndex,
      selectedMusicalScaleIndex,
      updateFrequency,
    },
    setOptions,
  ] = useReducer(optionsReducer, initialOptions);

  // note: synth intentionally not kept as part of app state
  const [synth, setSynth] = useState<maybeSynth>(null);

  const toggleSynth = (enable: boolean) => {
    if (enable) {
      setSynth(new Tone.PolySynth(Tone.Synth).toDestination());
    } else {
      setSynth(null);
    }
  };

  const controlString = useMemo(() => {
    let state: string[] = L_SYSTEMS[selectedSystemIndex].system.initialState;

    for (let i = 0; i < iterations; i++) {
      state = state.flatMap(L_SYSTEMS[selectedSystemIndex].system.rules);
    }

    return state;
  }, [iterations, selectedSystemIndex]);

  useEffect(() => {
    let timeout = null;

    if (currentStroke < controlString.length) {
      timeout = setTimeout(
        () =>
          setOptions({ name: "set_current_stroke", stroke: currentStroke + 1 }),
        1000 / updateFrequency
      );
    }

    return () => clearTimeout(timeout);
  }, [currentStroke, iterations, selectedSystemIndex]);

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
          onChange={(e) =>
            setOptions({
              name: "set_selected_system",
              index: Number(e.currentTarget.value),
            })
          }
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
          onInput={(e) =>
            setOptions({
              name: "set_iterations_clamped",
              iterations: Number(e.currentTarget.value),
            })
          }
          style="width: 5ch;"
        ></input>{" "}
        <button
          onClick={() =>
            setOptions({
              name: "set_iterations_clamped",
              iterations: iterations + 1,
            })
          }
        >
          Expand Once
        </button>{" "}
        <button
          onClick={() =>
            setOptions({
              name: "set_current_stroke",
              stroke: controlString.length + 1,
            })
          }
        >
          Skip to End
        </button>{" "}
        <button
          onClick={() => setOptions({ name: "set_current_stroke", stroke: 0 })}
        >
          Reset
        </button>{" "}
        <label for="freq">Frequency (Hz): </label>
        <input
          id="freq"
          type="number"
          value={updateFrequency}
          onInput={(e) =>
            setOptions({
              name: "set_update_frequency",
              frequency: Number(e.currentTarget.value),
            })
          }
          style="width: 5ch;"
        ></input>{" "}
        <hr></hr>
        <label for="stroke-color">Curve color: </label>
        <input
          id="stroke-color"
          type="color"
          value={curveColor}
          onInput={(e) =>
            setOptions({
              name: "set_curve_color",
              color: e.currentTarget.value,
            })
          }
        ></input>{" "}
        <label for="bg-color">Background color: </label>
        <input
          id="bg-color"
          type="color"
          value={bgColor}
          onInput={(e) =>
            setOptions({ name: "set_bg_color", color: e.currentTarget.value })
          }
        ></input>
        <hr></hr>
        <label for="sound">Enable Sound: </label>
        <input
          id="sound"
          type="checkbox"
          checked={synth !== null}
          onInput={(e) => toggleSynth(e.currentTarget.checked)}
        ></input>
        {" | "}
        <label for="MusicalScale">Scale (experimental): </label>
        <select
          id="MusicalScale"
          onChange={(e) =>
            setOptions({
              name: "set_selected_musical_scale",
              index: Number(e.currentTarget.value),
            })
          }
        >
          {SCALES.map(({ name }, i) => (
            <option value={i} key={i}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center">
        <CanvasManager
          currentSystem={L_SYSTEMS[selectedSystemIndex].system}
          musicalScale={SCALES[selectedMusicalScaleIndex].scale}
          moves={controlString}
          synth={synth}
          currentStroke={currentStroke}
          canvasParameters={{ curveColor, bgColor, canvasDimension: DIMENSION }}
        ></CanvasManager>
      </div>
      <div class="content-box">
        {L_SYSTEMS[selectedSystemIndex].system.description}
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
