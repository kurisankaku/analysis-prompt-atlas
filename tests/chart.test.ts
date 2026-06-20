// tests/chart.test.ts
import { describe, it, expect } from 'vitest';
import { extent, scalePoints } from '../src/lib/chart';

describe('extent', () => {
  it('最小・最大を返す', () => { expect(extent([3, 1, 2])).toEqual([1, 3]); });
  it('全要素同値でも幅を持たせる（0除算回避）', () => {
    const [lo, hi] = extent([5, 5, 5]);
    expect(hi).toBeGreaterThan(lo);
  });
});

describe('scalePoints', () => {
  it('データ範囲をSVG領域にマップし、yを反転する', () => {
    const pts = scalePoints([[0, 0], [10, 100]], { width: 100, height: 100, pad: 10 });
    // x: 0→pad(10), 10→width-pad(90)
    expect(pts[0].x).toBeCloseTo(10);
    expect(pts[1].x).toBeCloseTo(90);
    // y(値): 0→下端(height-pad=90), 100→上端(pad=10)
    expect(pts[0].y).toBeCloseTo(90);
    expect(pts[1].y).toBeCloseTo(10);
  });
  it('点が常に[pad, size-pad]の内側に収まる', () => {
    const pts = scalePoints([[1, 2], [5, 9], [3, 4]], { width: 200, height: 120, pad: 16 });
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(16); expect(p.x).toBeLessThanOrEqual(184);
      expect(p.y).toBeGreaterThanOrEqual(16); expect(p.y).toBeLessThanOrEqual(104);
    }
  });
});
