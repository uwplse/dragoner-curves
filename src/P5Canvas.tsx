import p5 from "p5";

import { useLayoutEffect, useRef } from "preact/hooks";

export default function P5Canvas({ sketch }) {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null)
  const p5Ref = useRef(null);

  useLayoutEffect(() => {
    if (canvasWrapperRef.current === null) {
      return;
    }

    p5Ref.current?.remove();
    p5Ref.current = new p5(sketch, canvasWrapperRef.current);
  }, [canvasWrapperRef.current, sketch])

  return <div ref={canvasWrapperRef} />
}
