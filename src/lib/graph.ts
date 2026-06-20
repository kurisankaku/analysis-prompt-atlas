// src/lib/graph.ts
// 関連グラフ構築のための純関数群。Astro/React やグラフライブラリには依存しない。
import type { Method } from '../content/schema';
import { MATH_CATS } from './taxonomy';

export type GraphNode = { id: string; name: string; category: string; color: string };
export type GraphEdge = { from: string; to: string; type: string };

// MATH_CATS の並び順に対応させる CSS 変数色のパレット。index を循環参照する。
const PALETTE = [
  'var(--color-signal)',
  'var(--color-water)',
  'var(--color-gold)',
  'var(--color-signal-deep)',
] as const;

/**
 * 数学的分類ラベルに CSS 変数色を割り当てる。
 * MATH_CATS 内の index を基準にパレットを循環参照。未知（index<0）は ink。
 */
export function categoryColor(category: string): string {
  const index = MATH_CATS.findIndex((c) => c.label === category);
  if (index < 0) return 'var(--color-ink)';
  return PALETTE[index % PALETTE.length];
}

/**
 * 手法集合から関連グラフ（ノード＋エッジ）を組み立てる。
 * - ノード＝各手法（category は mathCategories[0]）。
 * - エッジ＝各手法の related を走査。to が既存ノードのものだけ採用（参照整合性）。
 * - 対称な重複（A→B と B→A が同 type）は1本に集約する。
 */
export function buildGraph(methods: { id: string; data: Method }[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = methods.map(({ id, data }) => {
    const category = data.mathCategories[0];
    return { id, name: data.name, category, color: categoryColor(category) };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const { id, data } of methods) {
    for (const rel of data.related) {
      // 参照整合性：to が実在ノードでなければ捨てる。
      if (!nodeIds.has(rel.id)) continue;
      // 対称重複の集約：両端を sort してキー化する。
      const key = [id, rel.id].sort().join('—') + '|' + rel.type;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: id, to: rel.id, type: rel.type });
    }
  }

  return { nodes, edges };
}

/**
 * n 個の点を円周上に決定的に配置する。
 * i 番目の角度は -90°（真上）起点で時計回り：angle = -π/2 + 2π·i/n。
 */
export function circleLayout(
  n: number,
  opts: { cx: number; cy: number; r: number },
): { x: number; y: number }[] {
  const { cx, cy, r } = opts;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return points;
}
