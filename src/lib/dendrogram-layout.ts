// src/lib/dendrogram-layout.ts
// 階層クラスタリングのデンドログラム・レイアウト（純粋関数・テスト可能）。
// merges の a,b は「葉ラベル」または「既出マージの 0 始まりインデックス」を指す。

export type Merge = { a: string | number; b: string | number; height: number };

type Cluster = { x: number; height: number };

export type DendroBracket = {
  x1: number; y1: number; // 左の子の位置と高さ
  x2: number; y2: number; // 右の子の位置と高さ
  x: number;  height: number; // 併合後のクラスタ
};

export type DendrogramLayout = {
  leafX: Record<string, number>;
  brackets: DendroBracket[];
  maxHeight: number;
};

export function layoutDendrogram(leaves: string[], merges: Merge[]): DendrogramLayout {
  const leafX: Record<string, number> = {};
  leaves.forEach((l, i) => { leafX[l] = i; });

  const clusters: Cluster[] = [];
  const brackets: DendroBracket[] = [];
  let maxHeight = 0;

  const resolve = (ref: string | number): Cluster => {
    if (typeof ref === 'number') {
      const c = clusters[ref];
      if (!c) throw new Error(`未定義のマージ参照: ${ref}`);
      return c;
    }
    if (!(ref in leafX)) throw new Error(`未定義の葉: ${ref}`);
    return { x: leafX[ref], height: 0 };
  };

  for (const m of merges) {
    const A = resolve(m.a);
    const B = resolve(m.b);
    const x = (A.x + B.x) / 2;
    brackets.push({ x1: A.x, y1: A.height, x2: B.x, y2: B.height, x, height: m.height });
    clusters.push({ x, height: m.height });
    maxHeight = Math.max(maxHeight, m.height);
  }

  return { leafX, brackets, maxHeight };
}
