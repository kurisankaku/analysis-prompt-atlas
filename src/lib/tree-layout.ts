// src/lib/tree-layout.ts
// 決定木の模式図レイアウト（純粋関数・テスト可能）。
// 規約: node.label = ボックスの見出し（質問やカテゴリ）、node.condition = この node に
// 入る枝のラベル（「はい」「気温≥22℃」など）、node.leaf = 葉の結果テキスト。
import type { ChartColor, SampleChartConfig } from '../content/schema';

type TreeRoot = Extract<SampleChartConfig, { type: 'tree' }>['root'];

export type LaidNode = {
  id: number;
  x: number; // 0..1 に正規化した水平位置
  depth: number;
  label: string;
  condition?: string;
  leaf?: string;
  leafColor?: ChartColor;
  isLeaf: boolean;
};
export type LaidEdge = { from: number; to: number; label?: string };
export type TreeLayout = {
  nodes: LaidNode[];
  edges: LaidEdge[];
  depth: number;
  leafCount: number;
};

export function layoutTree(root: TreeRoot): TreeLayout {
  const nodes: LaidNode[] = [];
  const edges: LaidEdge[] = [];
  let leafCursor = 0;
  let maxDepth = 0;

  function visit(node: TreeRoot, depth: number): { id: number } {
    maxDepth = Math.max(maxDepth, depth);
    const id = nodes.length;
    const children = node.children ?? [];
    const isLeaf = children.length === 0;
    const laid: LaidNode = {
      id,
      x: 0,
      depth,
      label: node.label ?? '',
      condition: node.condition,
      leaf: node.leaf,
      leafColor: node.leafColor,
      isLeaf,
    };
    nodes.push(laid);
    if (isLeaf) {
      laid.x = leafCursor;
      leafCursor += 1;
      return { id };
    }
    const childXs: number[] = [];
    for (const c of children) {
      const r = visit(c, depth + 1);
      edges.push({ from: id, to: r.id, label: c.condition });
      childXs.push(nodes[r.id].x);
    }
    laid.x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
    return { id };
  }

  visit(root, 0);
  const leafCount = Math.max(1, leafCursor);
  for (const n of nodes) {
    n.x = leafCount === 1 ? 0.5 : n.x / (leafCount - 1);
  }
  return { nodes, edges, depth: maxDepth, leafCount };
}
