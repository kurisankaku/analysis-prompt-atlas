import { describe, it, expect } from 'vitest';
import { layoutTree } from '../src/lib/tree-layout';

describe('layoutTree', () => {
  const root = {
    label: '天気は晴れ？',
    children: [
      {
        condition: 'はい',
        label: '気温≥22℃？',
        children: [
          { condition: 'はい', label: '来店', leaf: '来店' },
          { condition: 'いいえ', label: '不来店', leaf: '不来店' },
        ],
      },
      { condition: 'いいえ', label: '不来店', leaf: '不来店' },
    ],
  };

  it('全ノードと葉を数える', () => {
    const l = layoutTree(root);
    expect(l.nodes.length).toBe(5);
    expect(l.leafCount).toBe(3);
    expect(l.depth).toBe(2);
    expect(l.edges.length).toBe(4);
  });

  it('葉でない node は子の中間に置かれる', () => {
    const l = layoutTree(root);
    const internal = l.nodes.find((n) => !n.isLeaf && n.depth === 1)!;
    const kids = l.edges.filter((e) => e.from === internal.id).map((e) => l.nodes[e.to].x);
    expect(internal.x).toBeCloseTo((kids[0] + kids[1]) / 2, 6);
  });

  it('x は 0..1 に正規化される', () => {
    const l = layoutTree(root);
    const xs = l.nodes.map((n) => n.x);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(1);
  });

  it('枝ラベルは子の condition から取る', () => {
    const l = layoutTree(root);
    const labels = l.edges.map((e) => e.label);
    expect(labels).toContain('はい');
    expect(labels).toContain('いいえ');
  });
});
