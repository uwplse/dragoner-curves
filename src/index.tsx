import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

import p5 from "p5";
import * as Tone from "tone";

import "./style.css";
import P5Canvas from "./P5Canvas";

const initialState = ["F"];

const dragonCurve = (ch: string): string[] => {
  switch (ch) {
    case "F":
      return ["F", "+", "G"];
    case "G":
      return ["F", "-", "G"];
    default:
      return [ch];
  }
};

export function App() {
  const [iterations, setIterations] = useState(0);
  const [sound, setSound] = useState(false);
  const [skipToEnd, setSkipToEnd] = useState(false);

  const [strokeWidth, setStrokeWidth] = useState(1);
  const [curveColor, setCurveColor] = useState("#FF0000");
  const [bgColor, setBgColor] = useState("#FCFCFC");

  const [currentStroke, setCurrentStroke] = useState(0);

  const controlString = useMemo(() => {
    let state: String[] = initialState;

    for (let i = 0; i < iterations; i++) {
      state = state.flatMap(dragonCurve);
    }

    return state;
  }, [iterations]);

  useEffect(() => {
    let timeout = null;

    if (skipToEnd) {
      setCurrentStroke(controlString.length + 1);
    } else if (currentStroke < controlString.length) {
      timeout = setTimeout(() => setCurrentStroke(currentStroke + 1), 250);
    }

    return () => clearTimeout(timeout);
  }, [currentStroke, iterations, skipToEnd]);

  const setIterationsClamped = (newIterations: number) => {
    if (newIterations > 15) {
      setIterations(15);
    } else {
      setIterations(newIterations);
    }
    setCurrentStroke(0);
  };

  return (
    <div class="grid-2">
      <div>
        <label for="iterations">Iterations: </label>
        <input
          id="iterations"
          type="number"
          value={iterations}
          onInput={(e) => setIterationsClamped(Number(e.currentTarget.value))}
        ></input>{" "}
        <button onClick={() => setIterationsClamped(iterations + 1)}>
          Expand
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
          checked={sound}
          onInput={(e) => setSound(e.currentTarget.checked)}
        ></input>{" "}
        <label for="skipToEnd">Skip To End: </label>
        <input
          id="skipToEnd"
          type="checkbox"
          checked={skipToEnd}
          onInput={(e) => setSkipToEnd(e.currentTarget.checked)}
        ></input>
        <hr></hr>
        <div className="text-center">
          <P5Canvas
            sketch={dragonCurveGenerator({
              moves: controlString,
              strokeWidth,
              curveColor,
              bgColor,
              sound,
              currentStroke,
            })}
          ></P5Canvas>
        </div>
      </div>
      <div>
        <div>
          <p style="text-align: left; border: 1px solid black; padding: 0.5em; width: 100%; height: 10ch; overflow-y: scroll;">
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
          Dragon Curve Rules:
          <ul>
            <li>start: F</li>
            <li>
              for every...
              <ul>
                <li>F &rarr; F + G</li>
                <li>G &rarr; F - G</li>
              </ul>
            </li>
          </ul>
        </div>
        <div>
          Dragon Curve Symbols:
          <dl>
            <dt>F</dt>
            <dd>visually: go forward by 5</dd>
            <dd>musically: play transformed note</dd>

            <dt>G</dt>
            <dd>visually: go forward by 5</dd>
            <dd>musically: play middle C</dd>

            <dt>+</dt>
            <dd>visually: turn left by 90 degrees</dd>
            <dd>musically: move F note up by 1 whole note</dd>

            <dt>-</dt>
            <dd>visually: turn right by 90 degrees</dd>
            <dd>musically: move F note down by 1 whole note</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

const dragonCurveGenerator = ({
  moves,
  strokeWidth,
  curveColor,
  bgColor,
  sound,
  currentStroke,
}) => {
  const DIMENSION = 600;

  enum Direction {
    Left = 0,
    Up,
    Right,
    Down,
  }

  const turnLeft = (dir: Direction): Direction => (4 + dir - 1) % 4;
  const turnRight = (dir: Direction): Direction => (dir + 1) % 4;

  const BASE_FREQUENCY = 262; // middle C
  const FREQUENCIES = [
    BASE_FREQUENCY,
    (BASE_FREQUENCY * 9) / 8,
    (BASE_FREQUENCY * 5) / 4,
    (BASE_FREQUENCY * 4) / 3,
    (BASE_FREQUENCY * 3) / 2,
    (BASE_FREQUENCY * 5) / 3,
    (BASE_FREQUENCY * 15) / 8,
    BASE_FREQUENCY * 2,
  ];

  const xDiff = (dir: Direction): number => {
    switch (dir) {
      case Direction.Left:
        return -1;
      case Direction.Right:
        return 1;
      default:
        return 0;
    }
  };

  const yDiff = (dir: Direction): number => {
    switch (dir) {
      case Direction.Up:
        return -1;
      case Direction.Down:
        return 1;
      default:
        return 0;
    }
  };

  return (p: p5) => {
    p.setup = () => {
      p.createCanvas(DIMENSION, DIMENSION);
      p.background(bgColor);

      p.stroke(curveColor);
      p.strokeWeight(strokeWidth);

      let currentX = DIMENSION / 2;
      let currentY = DIMENSION / 2;
      let currentDir = Direction.Up;

      let currNote = 0;

      for (let i = 0; i < moves.length && i <= currentStroke; i++) {
        if (i === currentStroke) {
          p.stroke("#000000");
        } else {
          p.stroke(curveColor);
        }

        const move = moves[i];

        switch (move) {
          case "F":
          case "G":
            let oldX = currentX;
            let oldY = currentY;

            currentX += 10 * xDiff(currentDir);
            currentY += 10 * yDiff(currentDir);

            p.line(oldX, oldY, currentX, currentY);
            break;
          case "+":
            currentDir = turnLeft(currentDir);
            // audio management
            currNote = (currNote + 1) % FREQUENCIES.length;
            break;
          case "-":
            currentDir = turnRight(currentDir);
            // audio management
            currNote = (FREQUENCIES.length + currNote - 1) % FREQUENCIES.length;
            break;
          default:
            console.error(`Unexpected move ${move}`);
        }

        if (sound && i == currentStroke) {
          const now = Tone.now();
          const synth = new Tone.PolySynth(Tone.Synth).toDestination();
          switch (move) {
            case "F":
              synth.triggerAttackRelease(FREQUENCIES[currNote], "8n", now);
              break;
            case "G":
              synth.triggerAttackRelease(BASE_FREQUENCY, "8n", now);
              break;
            case "+":
              break;
            case "-":
              break;
            default:
              console.error(`Unexpected move ${move}`);
          }
        }
      }
    };

    p.draw = () => {
      // intentionally left blank
    };
  };
};

render(<App />, document.getElementById("app"));
