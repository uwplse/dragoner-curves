import p5 from "p5";
import { JSX } from "preact";

export type LSystem<RenderState> = {
  /**
   * Starting state of the L-System; each `string` is an alphabet character.
   */
  initialState: string[];

  /**
   * A function to encode all the rules for a (context-free) L-System. This method will be .flatMap'd on a string[] to create the next iteration of the L-System.
   * @param ch the LHS of the rule
   * @returns the RHS of the rule
   */
  rules: (ch: string) => string[];

  /**
   * A Matt-defined constant that (aims) to prevent the app from crashing by expanding too much. Defined experimentally.
   */
  expansionLimit: number;

  /**
   * This is rendered when this element is chosen. Should explain
   * the rules and the relevant symbols.
   */
  description: JSX.Element;

  /**
   * Creates the initial state. Should be a pure function.
   * @param dimension p5 canvas size, in pixels. (assumption: width = height)
   * @returns fresh initial state with no iterations applied.
   */
  createRenderState: (dimension: number) => RenderState;

  /**
   * Evaluate one character/move - by updating the render state *and* render the result to p5. This is not a pure function, since it has a rendering side effect.
   * @param p p5 instance (used to render to canvas)
   * @param move the current move to update state with and render.
   * @param renderState the renderState *prior* to the current move.
   * @returns the new renderState *after* the move is completed.
   */
  updateRenderState: (p: p5, move: string, renderState: RenderState) => RenderState;

  /**
   * Play the sound from the current move. This function is *only* called when the current move is the last move processed by p5; this method does not need to handle timing.
   * @param move the current move to play the sound for
   * @param renderState the corresponding renderState for this move.
   * @returns
   */
  playSoundFromState: (move: string, renderState: RenderState) => void;
};
