import { render } from 'preact';
import { useState } from 'preact/hooks';

import p5 from "p5";
import * as Tone from "tone";

import './style.css';
import P5Canvas from './P5Canvas';

const initialState = [ "F" ];

const dragonCurve = (ch: string): string[] => {
	switch (ch) {
		case "F":
			return ["F", "+", "G"];
		case "G":
			return ["F", "-", "G"];
		default:
			return [ch];
	}
}

export function App() {
	const [iterations, setIterations] = useState(0);

	const [strokeWidth, setStrokeWidth] = useState(1);
	const [curveColor, setCurveColor] = useState("#FF0000");
	const [bgColor, setBgColor] = useState("#FCFCFC");

	const setIterationsClamped = (newIterations) => {
		if (iterations > 15) {
			setIterations(15);
			return;
		}

		setIterations(newIterations);
	}

	let str: String[] = initialState;

	for (let i = 0; i < iterations; i++) {
		str = str.flatMap(dragonCurve);
	}

	return (
		<div>
			<p style="text-align: left;">Iterations: {iterations}</p>
			<p style="text-align: left; border: 1px solid black; padding: 0.5em; width: 80ch; height: 10ch; overflow-y: scroll;">
				String: {str}
			</p>
			<hr></hr>
			<label for="iterations">Iterations: </label>
      <input id="iterations" type="number" value={iterations} onInput={(e) => setIterationsClamped(Number(e.currentTarget.value))}></input>
			{" "}
			<button onClick={() => setIterationsClamped(iterations + 1)}>Expand</button>
			{" "}
			<button onClick={() => setIterations(0)}>Reset</button>
			<hr></hr>
			<label for="stroke-width">Stroke Width: </label>
      <input id="stroke-width" type="number" value={strokeWidth} onInput={(e) => setStrokeWidth(Number(e.currentTarget.value))}></input>
			{" "}
			<label for="stroke-color">Curve color: </label>
      <input id="stroke-color" type="color" value={curveColor} onInput={(e) => setCurveColor(e.currentTarget.value)}></input>
			{" "}
			<label for="bg-color">Background color: </label>
      <input id="bg-color" type="color" value={bgColor} onInput={(e) => setBgColor(e.currentTarget.value)}></input>
			<hr></hr>
			<P5Canvas sketch={dragonCurveGenerator({ moves: str, strokeWidth, curveColor, bgColor })}></P5Canvas>
		</div>
	);
}

const dragonCurveGenerator = ({ moves, strokeWidth, curveColor, bgColor }) => {
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

	const played = moves.map((_) => false);

	const xDiff = (dir: Direction): number => {
		switch (dir) {
			case Direction.Left: return -1;
			case Direction.Right: return 1;
			default: return 0;
		}
	}

	const yDiff = (dir: Direction): number => {
		switch (dir) {
			case Direction.Up: return -1;
			case Direction.Down: return 1;
			default: return 0;
		}
	}

	const now = Tone.now();

	return (p: p5) => {
		const synth = new Tone.PolySynth(Tone.Synth).toDestination();

		p.setup = () => {
			p.createCanvas(DIMENSION, DIMENSION);
			p.background(bgColor);

			p.frameRate(30);
		}

		p.draw = () => {
			p.stroke(curveColor);
			p.strokeWeight(strokeWidth);

			let currentX = DIMENSION / 2;
			let currentY = DIMENSION / 2;
			let currentDir = Direction.Up;

			let currNote = 0;

			for (let i = 0; i < moves.length && i < p.frameCount / 3; i++) {
				const move = moves[i];

				// drawing
				switch (move) {
					case "F":
					case "G":
						let oldX = currentX;
        		let oldY = currentY;

						currentX += 5 * xDiff(currentDir);
						currentY += 5 * yDiff(currentDir);

						p.line(oldX, oldY, currentX, currentY);
						break;
					case "+":
						currentDir = turnLeft(currentDir);
						break;
					case "-":
						currentDir = turnRight(currentDir);
						break;
					default:
						console.error(`Unexpected move ${move}`);
				}

				// sound
				switch (move) {
					case "F":
						if (!played[i]) {
							synth.triggerAttackRelease(FREQUENCIES[currNote], "8n", now + (i / 10));
							played[i] = true;
						}
						break;
					case "G":
						if (!played[i]) {
							synth.triggerAttackRelease(BASE_FREQUENCY, "8n", now + (i / 10));
							played[i] = true;
						}
						break;
					case "+":
						currNote = (currNote + 1) % FREQUENCIES.length;
						break;
					case "-":
						currNote = (FREQUENCIES.length + currNote - 1) % FREQUENCIES.length;
						break;
					default:
						console.error(`Unexpected move ${move}`);
				}
			}
		};
	}
}

render(<App />, document.getElementById('app'));
