import { describe, it, expect } from 'vitest';
import { layoutDendrogram } from '../src/lib/dendrogram-layout';

describe('layoutDendrogram', () => {
  const leaves = ['A', 'B', 'C', 'D'];
  // A+B を低い高さで、C+D を併合、最後に両者を高い高さで併合。
  const merges = [
    { a: 'A', b: 'B', height: 1 },
    { a: 'C', b: 'D', height: 1.5 },
    { a: 0, b: 1, height: 3 },
  ];

  it('葉は 0..n-1 に並ぶ', () => {
    const l = layoutDendrogram(leaves, merges);
    expect(l.leafX).toEqual({ A: 0, B: 1, C: 2, D: 3 });
  });

  it('ブラケット数 = マージ数、最大高さを返す', () => {
    const l = layoutDendrogram(leaves, merges);
    expect(l.brackets.length).toBe(3);
    expect(l.maxHeight).toBe(3);
  });

  it('2 葉の併合は中点に位置する', () => {
    const l = layoutDendrogram(leaves, merges);
    expect(l.brackets[0].x).toBeCloseTo(0.5, 6); // (A=0 + B=1)/2
    expect(l.brackets[1].x).toBeCloseTo(2.5, 6); // (C=2 + D=3)/2
  });

  it('マージ参照（番号）を解決して上位の併合を置く', () => {
    const l = layoutDendrogram(leaves, merges);
    // 最後の併合は cluster0(x=0.5) と cluster1(x=2.5) の中点=1.5
    expect(l.brackets[2].x).toBeCloseTo(1.5, 6);
    expect(l.brackets[2].y1).toBe(1);   // 子クラスタ0 の高さ
    expect(l.brackets[2].y2).toBe(1.5); // 子クラスタ1 の高さ
  });

  it('未定義の葉参照はエラー', () => {
    expect(() => layoutDendrogram(['A', 'B'], [{ a: 'A', b: 'Z', height: 1 }])).toThrow();
  });
});
