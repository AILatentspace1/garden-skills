import { useEffect, useRef, useState } from "react";

/**
 * Canvas-drawn two-scale dot grid with noise-driven brightness flow.
 *
 * Opt-in: only renders when theme tokens.css sets  --dot-flow: 1.
 * Themes WITHOUT this variable (or set to 0) get zero overhead — the
 * component returns null immediately.
 *
 * Config: theme.json `dotFlow` field holds defaults; scaffold copies
 * them into the module-level dotFlowParams object.
 */

const W = 1920;
const H = 1080;

const LARGE_STEP = 48;
const LARGE_R    = 1.5;
const SMALL_STEP = 16;
const SMALL_R    = 1.0;
const DOT_COLOR  = "97,170,242";

const WAVES = [
  { fx: 0.011, fy: 0.007,  vx:  0.22, vy:  0.13, amp: 0.42 },
  { fx: 0.018, fy: -0.013, vx: -0.13, vy:  0.18, amp: 0.34 },
  { fx: 0.006, fy: 0.019,  vx:  0.09, vy: -0.08, amp: 0.24 },
  { fx: 0.014, fy: -0.009, vx:  0.17, vy: -0.11, amp: 0.28 },
  { fx: 0.008, fy: 0.016,  vx: -0.10, vy:  0.15, amp: 0.20 },
] as const;

export interface DotFlowParams {
  speed:       number;
  threshold:   number;
  brightAlpha: number;
  dimAlpha:    number;
  waveCount:   number;
}

export const dotFlowParams: DotFlowParams = {
  speed:       2.0,
  threshold:   -0.3,
  brightAlpha: 0.60,
  dimAlpha:    0.19,
  waveCount:   1,
};

/** Check if the active theme opts into dot-flow via CSS variable --dot-flow: 1 */
function useDotFlowEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue("--dot-flow")
      .trim();
    setEnabled(val === "1");
  }, []);
  return enabled;
}

export function DotFlowCanvas() {
  const enabled = useDotFlowEnabled();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const off = WAVES.map(() => ({ x: 0, y: 0 }));
    let raf: number;

    function noise(x: number, y: number, count: number): number {
      let v = 0;
      for (let i = 0; i < count; i++) {
        const w = WAVES[i]!;
        v += Math.sin((x - off[i]!.x) * w.fx + (y - off[i]!.y) * w.fy) * w.amp;
      }
      return v;
    }

    function batch(pts: number[], r: number, alpha: number) {
      if (!pts.length) return;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += 2) {
        ctx.moveTo(pts[i]! + r, pts[i + 1]!);
        ctx.arc(pts[i]!, pts[i + 1]!, r, 0, 6.2832);
      }
      ctx.fillStyle = `rgba(${DOT_COLOR},${alpha})`;
      ctx.fill();
    }

    function draw() {
      const p = dotFlowParams;
      const n = Math.min(Math.round(p.waveCount), WAVES.length);

      for (let i = 0; i < n; i++) {
        off[i]!.x += WAVES[i]!.vx * p.speed;
        off[i]!.y += WAVES[i]!.vy * p.speed;
      }

      ctx.clearRect(0, 0, W, H);

      const lHi: number[] = [], lLo: number[] = [];
      for (let x = LARGE_STEP / 2; x < W; x += LARGE_STEP)
        for (let y = LARGE_STEP / 2; y < H; y += LARGE_STEP)
          (noise(x, y, n) > p.threshold ? lHi : lLo).push(x, y);
      batch(lLo, LARGE_R, p.dimAlpha);
      batch(lHi, LARGE_R, p.brightAlpha);

      const sHi: number[] = [], sLo: number[] = [];
      for (let x = SMALL_STEP / 2; x < W; x += SMALL_STEP)
        for (let y = SMALL_STEP / 2; y < H; y += SMALL_STEP)
          (noise(x, y, n) > p.threshold ? sHi : sLo).push(x, y);
      batch(sLo, SMALL_R, p.dimAlpha * 0.4);
      batch(sHi, SMALL_R, p.brightAlpha * 0.4);

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
