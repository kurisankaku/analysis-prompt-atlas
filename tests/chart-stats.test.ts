import { describe, it, expect } from 'vitest';
import {
  mean, variance, stdev, quantile, quartiles, linearFit, correlation,
  logistic, logisticCurve, logisticBoundary, niceTicks,
  cosineSimilarity, cosineAngleDeg,
} from '../src/lib/chart-stats';

describe('mean / variance / stdev', () => {
  it('mean は平均を返す', () => {
    expect(mean([60, 70, 80, 90, 100])).toBe(80);
    expect(mean([])).toBe(0);
  });
  it('母分散・母標準偏差', () => {
    // [60,80,100] 平均80, 偏差^2=400+0+400=800, /3
    expect(variance([60, 80, 100])).toBeCloseTo(800 / 3, 6);
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2, 6); // 教科書例
  });
  it('不偏分散は n-1 で割る', () => {
    expect(variance([60, 80, 100], { sample: true })).toBeCloseTo(400, 6);
  });
});

describe('quantile / quartiles', () => {
  it('type-7 線形補間', () => {
    expect(quantile([1, 2, 3, 4, 5], 0.25)).toBe(2);
    expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(quantile([1, 2, 3, 4, 5], 0.75)).toBe(4);
  });
  it('5 数要約と IQR', () => {
    const f = quartiles([1, 2, 3, 4, 5]);
    expect(f).toMatchObject({ min: 1, q1: 2, median: 3, q3: 4, max: 5, iqr: 2 });
  });
  it('未ソートでも正しい', () => {
    expect(quartiles([5, 1, 3, 2, 4]).median).toBe(3);
  });
});

describe('linearFit / correlation', () => {
  it('完全な直線 y=2x+1 を復元し R²=1', () => {
    const f = linearFit([[0, 1], [1, 3], [2, 5], [3, 7]]);
    expect(f.slope).toBeCloseTo(2, 6);
    expect(f.intercept).toBeCloseTo(1, 6);
    expect(f.r2).toBeCloseTo(1, 6);
  });
  it('正の相関は +、負の相関は -', () => {
    expect(correlation([[1, 1], [2, 2], [3, 3]])).toBeCloseTo(1, 6);
    expect(correlation([[1, 3], [2, 2], [3, 1]])).toBeCloseTo(-1, 6);
  });
});

describe('logistic', () => {
  it('x=境界で 0.5', () => {
    expect(logistic(0, 0, 1)).toBeCloseTo(0.5, 6);
  });
  it('境界 = -b0/b1', () => {
    expect(logisticBoundary(-2, 1)).toBe(2);
    expect(logistic(2, -2, 1)).toBeCloseTo(0.5, 6);
  });
  it('曲線は単調増加で 0..1 の範囲', () => {
    const c = logisticCurve(-2, 1, 0, 8, 8);
    expect(c[0][1]).toBeLessThan(c[c.length - 1][1]);
    for (const [, y] of c) { expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(1); }
  });
});

describe('niceTicks', () => {
  it('0..100 はきりのいい目盛り（1/2/5/10 系の刻み）', () => {
    expect(niceTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
  });
  it('0..10 を含む', () => {
    const t = niceTicks(0, 10, 5);
    expect(t[0]).toBe(0);
    expect(t[t.length - 1]).toBeGreaterThanOrEqual(10);
  });
});

describe('cosine', () => {
  it('同方向=1, 直交=0', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1, 6);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
  });
  it('直交は 90 度', () => {
    expect(cosineAngleDeg([1, 0], [0, 1])).toBeCloseTo(90, 6);
    expect(cosineAngleDeg([2, 2], [3, 3])).toBeCloseTo(0, 6);
  });
});
