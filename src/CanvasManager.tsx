import { useEffect, useRef } from "preact/hooks";
import { LSystem, maybeSynth } from "./utils";

type CanvasParameters = {
  curveColor: string;
  bgColor: string;
  canvasDimension: number;
};

type CanvasManagerProps = {
  currentSystem: LSystem<any>,
  moves: string[],
  synth: maybeSynth,
  currentStroke: number,
  canvasParameters: CanvasParameters;
}

export default function CanvasManager({ currentSystem, moves, synth, currentStroke, canvasParameters }: CanvasManagerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const { curveColor, bgColor, canvasDimension } = canvasParameters;

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    if (contextRef.current === null) {
      contextRef.current = canvasRef.current.getContext('2d');
    }

    contextRef.current.fillStyle = bgColor;
    contextRef.current.fillRect(0, 0, canvasDimension, canvasDimension);

  }, [canvasParameters, canvasRef, contextRef]);

  useEffect(() => {
    if (canvasRef.current === null || contextRef.current === null) return;

    let renderState = currentSystem.createRenderState(canvasDimension);

    for (let i = 0; i < moves.length && i <= currentStroke; i++) {
      if (i === currentStroke) {
        contextRef.current.strokeStyle = "#000000";
      } else {
        contextRef.current.strokeStyle = curveColor;
      }

      const move = moves[i];

      renderState = currentSystem.updateStateAndRender(contextRef.current, move, renderState);

      if (synth !== null && i === currentStroke) {
        currentSystem.playSoundFromState(synth, move, renderState);
      }
    }

  }, [currentSystem, moves, synth, currentStroke, canvasParameters, canvasRef, contextRef]);


  return <canvas ref={canvasRef} width={canvasDimension} height={canvasDimension} />
}
