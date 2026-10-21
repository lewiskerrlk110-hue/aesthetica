"use client";

import { useEffect, useRef } from "react";

// Shared canvas loop with DPR scaling, visibility pausing,
// reduced-motion awareness and resize handling.
export function useCanvasLoop(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void,
  options?: { reduced?: boolean },
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  const reducedRef = useRef(options?.reduced ?? false);

  useEffect(() => {
    drawRef.current = draw;
    reducedRef.current = options?.reduced ?? false;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let last = performance.now();
    let start = last;
    let w = 0;
    let h = 0;
    let staticDrawn = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - last);
      last = now;
      if (w !== canvas.getBoundingClientRect().width) resize();
      drawRef.current(ctx, w, h, now - start, dt);
      raf = requestAnimationFrame(frame);
    };

    const drawStatic = () => {
      // single frame for reduced motion
      resize();
      drawRef.current(ctx, w, h, 4000, 0);
    };

    resize();

    const reduced = reducedRef.current;
    if (reduced) {
      drawStatic();
      const ro = new ResizeObserver(() => drawStatic());
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        start = last;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      void staticDrawn;
    };
  }, [options?.reduced]);

  return canvasRef;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
