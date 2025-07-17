import * as Tone from "tone";

import { useEffect, useRef, useState } from "preact/hooks";
import { LSystem, maybeSynth } from "./utils";
type CanvasParameters = {
  curveColor: string;
  bgColor: string;
  canvasDimension: number;
};

type CanvasManagerProps = {
  currentSystem: LSystem<any>;
  moves: string[];
  musicalScale: Tone.Unit.Frequency[];
  synth: maybeSynth;
  currentStroke: number;
  canvasParameters: CanvasParameters;
};

type CanvasState = {
  moving: boolean;
  previousX: number;
  previousY: number;
  viewportTransform: {
    x: number;
    y: number;
    scale: number;
  };
};

const initialCanvasState = {
  moving: false,
  previousX: 0,
  previousY: 0,
  viewportTransform: {
    x: 0,
    y: 0,
    scale: 1,
  },
};

export default function CanvasManager({
  currentSystem,
  moves,
  musicalScale,
  synth,
  currentStroke,
  canvasParameters,
}: CanvasManagerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPlayedStroke = useRef(-1);

  const [canvasState, setCanvasState] =
    useState<Readonly<CanvasState>>(initialCanvasState);

  const { curveColor, bgColor, canvasDimension } = canvasParameters;

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    if (contextRef.current === null) {
      contextRef.current = canvasRef.current.getContext("2d");
    }

    // set up pan & zoom listeners
    // this is an adapted version of the approach described here:
    // https://harrisonmilbradt.com/blog/canvas-panning-and-zooming
    canvasRef.current.onmousedown = (e) => {
      setCanvasState({
        ...canvasState,
        moving: true,
        previousX: e.clientX,
        previousY: e.clientY,
      });
    };

    canvasRef.current.onmousemove = (e) => {
      if (!canvasState.moving) return;

      const newViewportTransformX =
        canvasState.viewportTransform.x + e.clientX - canvasState.previousX;
      const newViewportTransformY =
        canvasState.viewportTransform.y + e.clientY - canvasState.previousY;

      setCanvasState({
        moving: true,
        previousX: e.clientX,
        previousY: e.clientY,
        viewportTransform: {
          x: newViewportTransformX,
          y: newViewportTransformY,
          scale: canvasState.viewportTransform.scale,
        },
      });
    };

    canvasRef.current.onmouseup = (e) => {
      if (!canvasState.moving) return;

      setCanvasState({ ...canvasState, moving: false });
    };

    canvasRef.current.onwheel = (e) => {
      const oldX = canvasState.viewportTransform.x;
      const oldY = canvasState.viewportTransform.y;

      const localX = e.clientX;
      const localY = e.clientY;

      const previousScale = canvasState.viewportTransform.scale;

      const newScale = (canvasState.viewportTransform.scale +=
        e.deltaY * -0.001);

      const newX = localX - (localX - oldX) * (newScale / previousScale);
      const newY = localY - (localY - oldY) * (newScale / previousScale);

      setCanvasState({
        ...canvasState,
        viewportTransform: {
          x: newX,
          y: newY,
          scale: newScale,
        },
      });
    };
  }, [canvasParameters, canvasRef, contextRef, canvasState]);

  useEffect(() => {
    if (canvasRef.current === null || contextRef.current === null) return;

    contextRef.current.setTransform(1, 0, 0, 1, 0, 0); // reset transform before redrawing

    contextRef.current.fillStyle = bgColor;
    contextRef.current.fillRect(0, 0, canvasDimension, canvasDimension);

    contextRef.current.setTransform(
      canvasState.viewportTransform.scale,
      0,
      0,
      canvasState.viewportTransform.scale,
      canvasState.viewportTransform.x,
      canvasState.viewportTransform.y
    );

    let renderState = currentSystem.createRenderState(canvasDimension);

    for (let i = 0; i < moves.length && i <= currentStroke; i++) {
      if (i === currentStroke) {
        contextRef.current.strokeStyle = "#000000";
      } else {
        contextRef.current.strokeStyle = curveColor;
      }

      const move = moves[i];

      renderState = currentSystem.updateStateAndRender(
        contextRef.current,
        move,
        renderState,
        musicalScale
      );

      if (
        synth !== null &&
        i === currentStroke &&
        i !== lastPlayedStroke.current
      ) {
        currentSystem.playSoundFromState(synth, move, renderState, musicalScale);
        lastPlayedStroke.current = i;
      }
    }
  }, [
    currentSystem,
    musicalScale,
    moves,
    synth,
    currentStroke,
    canvasParameters,
    canvasRef,
    contextRef,
    canvasState,
  ]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={canvasDimension}
        height={canvasDimension}
        style={"cursor: grab;"}
      />
      <p style="margin: 0.5rem;">
        (experimental) drag to pan, mouse wheel to zoom.
      </p>
      <button onClick={() => setCanvasState(initialCanvasState)}>
        Reset Canvas
      </button>
    </>
  );
}
