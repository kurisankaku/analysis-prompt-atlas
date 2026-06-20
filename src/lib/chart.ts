// src/lib/chart.ts
import type { Method } from '../content/schema';

export type SampleChart = NonNullable<Method['sampleChart']>;
export type Pt = { x: number; y: number };

export function extent(values: number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  let lo = Math.min(...values), hi = Math.max(...values);
  if (lo === hi) { lo -= 1; hi += 1; }
  return [lo, hi];
}

export function scalePoints(points: number[][], opts: { width: number; height: number; pad: number }): Pt[] {
  const { width, height, pad } = opts;
  const [xlo, xhi] = extent(points.map((p) => p[0]));
  const [ylo, yhi] = extent(points.map((p) => p[1]));
  const sx = (x: number) => pad + ((x - xlo) / (xhi - xlo)) * (width - 2 * pad);
  const sy = (y: number) => height - pad - ((y - ylo) / (yhi - ylo)) * (height - 2 * pad);
  return points.map((p) => ({ x: sx(p[0]), y: sy(p[1]) }));
}
