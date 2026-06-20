# サンプル分布チャート 実装計画（Plan 5 / v1 マイルストーン5）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** 各手法の `sampleChart` データを、手法詳細ページの「サンプルで見る」セクションに**静的SVGのグラフ**として描画し、「サンプルデータが実際にどんな分布・形になるか」をひと目で伝える。

**Architecture:** 静的Astro。チャートはビルド時に確定する固定データのため、**クライアントJSやチャートライブラリは使わず、サーバ描画の静的SVG**で実装する（モック `mockup/method.html` の散布図も手描きSVG）。`src/lib/chart.ts` が座標スケーリング等の純関数を提供（テスト容易）、`MethodChart.astro` がチャート種別ごとにSVGを描画。`MethodDetail.astro` に「サンプルで見る」セクションを追加。

> 設計判断: 当初スタックで挙げた Observable Plot は「動的な可視化」向け。本サービスのサンプルチャートは**ビルド時固定データ**なので、クライアントライブラリは不要で、静的SVGの方が軽量・テスト可能・モックの手描き表現に一致する。これは当初案の精緻化であり、機能要件（サンプル分布の可視化）はそのまま満たす。

**Tech Stack:** Astro 5 / TS strict / Tailwind v4 / Vitest（クライアントJS不要・追加ライブラリ無し）。

## Global Constraints
- 言語は**日本語のみ**、静的サイト、**クライアントJS不要**（チャートは静的SVG）。
- スタイルは **Tailwind v4** ＋ `@theme` トークン。SVGの色は地形図パレットのデータ色（モック準拠）：マゼンタ `var(--color-signal)`、水色 `var(--color-water)`、金 `var(--color-gold)`、罫線 `var(--color-line-strong)`、軸ラベル `var(--color-ink-faint)`。生hexは避け、CSS変数で参照。
- 対応するチャート種別: **scatter / bar / line / histogram** を実装。`box` / `heatmap` は当面フォールバック表示「（この種別のサンプル可視化は準備中）」（スキーマは6種を許容するが、現行コンテンツは使用しない）。
- `sampleChart` が無い手法では「サンプルで見る」セクションを描画しない。
- スキーマは変更しない（`sampleChart` は Plan 1 で定義済み：`{ type, caption?, series: [{label?, points: number[][]}] }`）。

## File Structure
- `src/lib/chart.ts` — 純粋なチャート幾何ヘルパー（`scalePoints` ほか）＋型エイリアス。中核・テスト対象。
- `src/components/MethodChart.astro` — `sampleChart` を受け取り静的SVGを描画（種別分岐）。
- `src/components/MethodDetail.astro` — **修正**：「サンプルで見る」セクションを追加し、`sampleChart` があるとき `MethodChart` を描画。
- `tests/chart.test.ts` — `scalePoints` 等の単体テスト。
- `tests/components.test.ts` — `MethodChart` の Container テストを追記。

---

## Task 1: チャート幾何ヘルパー（純関数）

**Files:** Create `src/lib/chart.ts`; Test `tests/chart.test.ts`

**Interfaces:**
- Consumes: `Method`（`sampleChart` の型に利用）
- Produces:
  - `type SampleChart = NonNullable<Method['sampleChart']>`
  - `type Pt = { x: number; y: number }`
  - `extent(values: number[]): [number, number]`（最小・最大。全要素同値なら [v-1, v+1] のように0除算回避）
  - `scalePoints(points: number[][], opts: { width: number; height: number; pad: number }): Pt[]`（データ座標→SVG座標。x昇順スケール、yは上方向が大きい＝SVGでは反転。pad分の余白）

- [ ] **Step 1: 失敗するテストを書く**
```ts
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
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: 実装する**
```ts
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
```

- [ ] **Step 4: 実行して成功を確認** → PASS。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/lib/chart.ts tests/chart.test.ts
git commit -m "feat: add pure chart geometry helpers (extent, scalePoints)"
```

---

## Task 2: MethodChart コンポーネントと詳細ページ統合

**Files:** Create `src/components/MethodChart.astro`; Modify `src/components/MethodDetail.astro`; Test add to `tests/components.test.ts`

**Interfaces:**
- Consumes: `SampleChart`、`scalePoints`/`extent`（chart.ts）
- Produces: `MethodChart`（props: `{ chart: SampleChart }`）— `chart.type` に応じSVG描画。`MethodDetail` に「サンプルで見る」セクション。

- [ ] **Step 1: MethodChart の Container テスト（失敗）**
```ts
// tests/components.test.ts （追記）
import MethodChart from '../src/components/MethodChart.astro';

describe('MethodChart', () => {
  const make = (type: string) => ({ type, caption: 'cap', series: [{ label: 's', points: [[1, 60], [2, 70], [3, 80]] }] });
  it('bar はSVGに矩形を描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('bar') } });
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
    expect(html).toContain('cap'); // caption
  });
  it('scatter はSVGに円を描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('scatter') } });
    expect(html).toContain('<circle');
  });
  it('line は折れ線(polyline)を描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('line') } });
    expect(html).toContain('<polyline');
  });
  it('未対応種別(box)はフォールバック文言', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('box') } });
    expect(html).toContain('準備中');
  });
});
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: MethodChart を実装**
`chart.type` で分岐：
- `scatter`: `scalePoints` で全 series の点を円（`<circle r=3 fill="var(--color-signal)">`）。複数 series は色を変える（signal/water/gold）。軸線を `var(--color-line-strong)`。
- `line`: `scalePoints` → `<polyline points=... stroke="var(--color-signal)" fill="none">`。
- `bar`: points の x を等間隔、y(値)で高さ。`<rect fill="var(--color-signal)">`。
- `histogram`: bar と同じ描画（事前ビン化済みの points を棒で表示）。
- `box` / `heatmap`: `<p>（この種別のサンプル可視化は準備中）</p>` のフォールバック。
- caption は `<figcaption>` に `var(--color-ink-faint)` 風で表示。`<figure>` でラップ、`viewBox` 指定でレスポンシブ。`@theme` トークン（CSS変数）使用。

- [ ] **Step 4: MethodDetail に「サンプルで見る」セクションを統合**
`MethodDetail.astro` の「どんなデータを用意する？」セクションの後に、`{method.sampleChart && (<section>... <h2>サンプルで見る</h2> <MethodChart chart={method.sampleChart} /> </section>)}` を追加（既存セクションと同じ見出しスタイル＝先頭にシグナルバー）。`sampleChart` 不在なら描画しない。既存の MethodDetail テストは壊さない（セクション追加のみ）。

- [ ] **Step 5: 成功 ＋ ビルド検証**
Run: `npx vitest run tests/components.test.ts tests/chart.test.ts` → PASS。`npm run build` → `dist/methods/mean/index.html` に「サンプルで見る」と `<svg`・`<rect`（mean は bar チャート）が含まれ、`dist/methods/median/index.html` には（median に sampleChart が無いので）「サンプルで見る」が**含まれない**こと。`npx astro check` 0エラー、`npm test` 全green。

- [ ] **Step 6: コミット**
```bash
git add src/components/MethodChart.astro src/components/MethodDetail.astro tests/components.test.ts
git commit -m "feat: render sample-distribution charts as static SVG on method pages"
```

---

## Self-Review（カバレッジ）
- spec §4-5（サンプルで見る：サンプルデータの分布をグラフで）→ Task 2。
- spec コンテンツ方針（グラフでサンプル分布を見せる）→ 充足（scatter/bar/line/histogram）。
- クライアントJS不要の静的SVGで実装（設計判断を明記）。box/heatmap はフォールバックで安全。
- スキーマ変更なし。プレースホルダ無し。型整合（`SampleChart` を chart.ts・MethodChart・MethodDetail で一貫使用）。

## 次の Plan
Plan 6 関係マップ（アトラス）／Plan 7 共通注意＋仕上げ／コンテンツ制作。
