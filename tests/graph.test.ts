// tests/graph.test.ts
import { describe, it, expect } from 'vitest';
import { buildGraph, circleLayout, categoryColor } from '../src/lib/graph';
import { sampleMethod } from './fixtures/sample-method';

const methods = [
  { id: 'mean', data: sampleMethod }, // related: [{id:'median', type:'比較対象'}]
  { id: 'median', data: { ...sampleMethod, name: '中央値', related: [{ id: 'mean', type: '比較対象' }] } as any },
];

describe('buildGraph', () => {
  const g = buildGraph(methods);
  it('全手法をノード化し名前と色を持つ', () => {
    expect(g.nodes.map((n) => n.id).sort()).toEqual(['mean', 'median']);
    expect(g.nodes.find((n) => n.id === 'mean')!.name).toBe('平均');
    expect(g.nodes.find((n) => n.id === 'median')!.name).toBe('中央値');
    expect(g.nodes.find((n) => n.id === 'mean')!.color).toMatch(/var\(--color-/);
    // category は mathCategories[0] 由来
    expect(g.nodes.find((n) => n.id === 'mean')!.category).toBe('基礎統計');
  });
  it('対称な重複エッジを1本に集約する', () => {
    expect(g.edges).toHaveLength(1);
    expect(g.edges[0].type).toBe('比較対象');
  });
  it('実在しない related.id のエッジは捨てる', () => {
    const g2 = buildGraph([{ id: 'mean', data: { ...sampleMethod, related: [{ id: 'ghost', type: '発展' }] } as any }]);
    expect(g2.edges).toHaveLength(0);
    expect(g2.nodes).toHaveLength(1);
  });
});

describe('circleLayout', () => {
  it('n個の座標を決定的に返す', () => {
    const a = circleLayout(4, { cx: 100, cy: 100, r: 50 });
    const b = circleLayout(4, { cx: 100, cy: 100, r: 50 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(4);
    // 先頭は真上（-90°）付近：x≈cx, y≈cy-r
    expect(a[0].x).toBeCloseTo(100);
    expect(a[0].y).toBeCloseTo(50);
  });
});

describe('categoryColor', () => {
  it('既知分類はCSS変数、未知はink', () => {
    expect(categoryColor('基礎統計')).toMatch(/var\(--color-/);
    expect(categoryColor('存在しない')).toBe('var(--color-ink)');
  });
});
