# 関係マップ（アトラス） 実装計画（Plan 6 / v1 マイルストーン6）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** 手法どうしの関係（`related`）を、色＝分類・線＝関係種別で可視化した「関係マップ（アトラス）」ページ `/atlas` を実装する。

**Architecture:** 静的Astro。関係グラフはビルド時に確定する固定データのため、**クライアントJSやグラフライブラリは使わず、決定的レイアウト（円環配置）の静的SVG**で描画する（モック `mockup/atlas.html` も手描きSVG）。`src/lib/graph.ts` が `related` からノード・エッジを構築し（純関数・テスト容易）、円環座標を計算。`AtlasGraph.astro` が静的SVGを描画。`/atlas` ページが全手法のグラフを表示。

> 設計判断: 当初スタックの Cytoscape.js は動的・力学レイアウト向け。v1の関係データはビルド時固定で件数も限定的なため、決定的な静的SVG（円環レイアウト）が軽量・テスト可能・モックの手描き表現に一致する。機能要件（関係の可視化）は満たす。将来ノードが大幅に増えたら対話的レイアウトへ拡張可能。

**Tech Stack:** Astro 5 / TS strict / Tailwind v4 / Vitest（クライアントJS不要・追加ライブラリ無し）。

## Global Constraints
- 言語は**日本語のみ**、静的サイト、**クライアントJS不要**（グラフは静的SVG）。
- スタイルは **Tailwind v4** ＋ `@theme` トークン。ノード色＝分類（CSS変数のデータ色を循環）、エッジ色＝関係種別、軸/罫線 `var(--color-line-strong)`。生hexは避けCSS変数を使う。
- グラフは `related`（9種の関係）と所属分類（`mathCategories[0]`）から構築。`related[].id` が実在ノードに解決するエッジのみ採用（参照整合）。対称な重複エッジ（mean→median と median→mean）は1本に集約。
- レイアウトは**決定的**（円環配置：ノード i を角度 2πi/N に配置）。ランダム性禁止（再現性のため）。
- ヘッダーの「関係マップ」リンク（現在 `/atlas` を指す TODO）を本ページに接続。

## File Structure
- `src/lib/graph.ts` — `buildGraph(methods)`（ノード・エッジ構築・重複集約）、`categoryColor(category)`（分類→CSS変数色）、`circleLayout(n, ...)`（円環座標）。中核・テスト対象。
- `src/components/AtlasGraph.astro` — グラフSVG（props: nodes/edges）。エッジ→ノードの順で描画、凡例。
- `src/pages/atlas.astro` — `/atlas` ページ（全手法グラフ＋説明）。
- `tests/graph.test.ts` — `buildGraph`・`circleLayout` の単体テスト。
- `tests/components.test.ts` — `AtlasGraph` の Container テスト追記。

---

## Task 1: グラフ構築ヘルパー（純関数）

**Files:** Create `src/lib/graph.ts`; Test `tests/graph.test.ts`

**Interfaces:**
- Consumes: `Method`、`MATH_CATS`（色割当の基準順）
- Produces:
  - `type GraphNode = { id: string; name: string; category: string; color: string }`
  - `type GraphEdge = { from: string; to: string; type: string }`
  - `buildGraph(methods: { id: string; data: Method }[]): { nodes: GraphNode[]; edges: GraphEdge[] }`
  - `categoryColor(category: string): string`（`MATH_CATS` の index に基づきCSS変数色を循環で割当。未知は ink）
  - `circleLayout(n: number, opts: { cx: number; cy: number; r: number }): { x: number; y: number }[]`（決定的・角度は -90°起点で時計回り）

- [ ] **Step 1: 失敗するテストを書く**
```ts
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
    expect(g.nodes.find((n) => n.id === 'mean')!.color).toMatch(/var\(--color-/);
  });
  it('対称な重複エッジを1本に集約する', () => {
    expect(g.edges).toHaveLength(1);
    expect(g.edges[0].type).toBe('比較対象');
  });
  it('実在しない related.id のエッジは捨てる', () => {
    const g2 = buildGraph([{ id: 'mean', data: { ...sampleMethod, related: [{ id: 'ghost', type: '発展' }] } as any }]);
    expect(g2.edges).toHaveLength(0);
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
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: 実装する**
- `categoryColor`: パレット配列（例 `['var(--color-signal)','var(--color-water)','var(--color-gold)','var(--color-ink)','var(--color-signal-deep)', ...]`）を `MATH_CATS.findIndex(c => c.label === category)` の index で循環参照。未知（index<0）は `var(--color-ink)`。
- `buildGraph`: ノード＝各手法（category=`mathCategories[0]`、color=`categoryColor(...)`）。エッジ＝各手法の `related` を走査し、`to` が node 集合に含まれるものだけ採用。対称重複は `key = [from,to].sort().join('—') + '|' + type` で集約。
- `circleLayout`: `i` 番目を `angle = -Math.PI/2 + (2*Math.PI*i)/n`、`x=cx+r*cos`、`y=cy+r*sin`。

- [ ] **Step 4: 実行して成功を確認** → PASS。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/lib/graph.ts tests/graph.test.ts
git commit -m "feat: add relationship-graph builder and deterministic circle layout"
```

---

## Task 2: AtlasGraph コンポーネントと /atlas ページ

**Files:** Create `src/components/AtlasGraph.astro`, `src/pages/atlas.astro`; Modify `src/components/SiteHeader.astro`（必要なら active 対応）; Test add to `tests/components.test.ts`

**Interfaces:**
- Consumes: `buildGraph`/`circleLayout`/`categoryColor`、`allMethods()`、`MATH_CATS`、`BaseLayout`
- Produces: `AtlasGraph`（props: `{ nodes: GraphNode[]; edges: GraphEdge[] }`）— 円環レイアウトでSVG描画（エッジ→ノードの順）。`/atlas` ページ。

- [ ] **Step 1: AtlasGraph の Container テスト（失敗）**
```ts
// tests/components.test.ts （追記）
import AtlasGraph from '../src/components/AtlasGraph.astro';

describe('AtlasGraph', () => {
  it('ノードを円・エッジを線で描き、手法名を表示する', async () => {
    const c = await AstroContainer.create();
    const nodes = [
      { id: 'mean', name: '平均', category: '基礎統計', color: 'var(--color-signal)' },
      { id: 'median', name: '中央値', category: '基礎統計', color: 'var(--color-signal)' },
    ];
    const edges = [{ from: 'mean', to: 'median', type: '比較対象' }];
    const html = await c.renderToString(AtlasGraph, { props: { nodes, edges } });
    expect(html).toContain('<svg');
    expect(html).toContain('<line'); // エッジ
    expect(html).toContain('<circle'); // ノード
    expect(html).toContain('平均');
    expect(html).toContain('中央値');
    expect(html).toContain('/methods/mean'); // ノードは詳細へリンク
  });
  it('ノード0件でも壊れない', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(AtlasGraph, { props: { nodes: [], edges: [] } });
    expect(html).toContain('<svg');
  });
});
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: AtlasGraph を実装（モック `atlas.html` 準拠）**
`circleLayout(nodes.length, {cx,cy,r})` で座標を得、id→座標の Map を作る。先にエッジ（`<line>` 関係種別で色分け：比較対象=water / 併用=good相当 / 発展=signal / 前処理=gold / その他=line-strong）、次にノード（`<circle r=… fill={node.color}>` ＋ ラベル `<text>` ＋ ノード全体を `<a href={`/methods/${id}`}>` で包む）。凡例（分類色・関係種別）。`viewBox` 指定でレスポンシブ。`@theme` トークン/CSS変数。ラベルは `paint-order="stroke"` で可読性確保。

- [ ] **Step 4: /atlas ページと導線**
```astro
---
// src/pages/atlas.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import AtlasGraph from '../components/AtlasGraph.astro';
import { allMethods } from '../lib/methods';
import { buildGraph } from '../lib/graph';
const { nodes, edges } = buildGraph(await allMethods());
---
<BaseLayout title="関係マップ | 分析手法アトラス" active="関係マップ">
  <h1 class="font-display text-2xl font-bold mt-4">手法の関係マップ</h1>
  <p class="text-ink-soft mt-2 mb-6">手法どうしのつながりを地図にしたもの。色は分類、線は関係の種類を表します。</p>
  <AtlasGraph nodes={nodes} edges={edges} />
</BaseLayout>
```
`SiteHeader.astro`：`関係マップ` ナビは既に `/atlas` を指す。`active="関係マップ"` でハイライトされるよう、ラベル一致を確認（必要なら調整）。

- [ ] **Step 5: 成功 ＋ ビルド検証**
Run: `npx vitest run tests/graph.test.ts tests/components.test.ts` → PASS。`npm run build` → `dist/atlas/index.html` が生成され、`<svg`・`<circle`・`<line`・`平均`・`中央値`・`/methods/mean` を含むこと。`npx astro check` 0エラー、`npm test` 全green。クライアントJSが増えていない（island は依然 /search の1つのみ）こと。

- [ ] **Step 6: コミット**
```bash
git add src/lib/graph.ts src/components/AtlasGraph.astro src/pages/atlas.astro src/components/SiteHeader.astro tests/components.test.ts
git commit -m "feat: add /atlas relationship map (static SVG graph)"
```

---

## Self-Review（カバレッジ）
- spec §3.1 #5（関係マップ／アトラス）→ Task 1/2。
- spec §5.3（9種の関係）→ エッジ種別で色分け。色＝分類（§5.2）。
- 参照整合・重複集約をテストで担保。決定的レイアウト。
- クライアントJSなしの静的SVG（設計判断を明記）。
- スキーマ変更なし。プレースホルダ無し。型整合（`GraphNode/GraphEdge` を graph.ts・AtlasGraph・atlas ページで一貫使用）。

## 次の Plan
Plan 7 共通注意ページ＋仕上げ（SEO・アクセシビリティ・残課題クリーンアップ）／コンテンツ制作（代表手法の拡充）。
