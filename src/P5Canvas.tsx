import p5 from "p5";

import { useEffect, useRef } from "preact/hooks";

export default function P5Canvas({ sketch }) {
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null)
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (canvasWrapperRef.current === null) {
      return;
    }

    p5Ref.current?.remove();
    p5Ref.current = new p5(sketch, canvasWrapperRef.current);

    return () => {
      p5Ref.current?.remove();
    }
  }, [canvasWrapperRef.current, sketch])

  return <div ref={canvasWrapperRef} />
}
