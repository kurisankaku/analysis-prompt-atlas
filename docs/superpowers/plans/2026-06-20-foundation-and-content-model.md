# 基盤とコンテンツモデル 実装計画（Plan 1 / v1 マイルストーン1）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 型付きの構造化コンテンツ（手法エンティティ）から、§4の手法詳細ページが静的に描画される最小構成のAstroサイトを立ち上げる。

**Architecture:** Astro（静的出力・サーバー/DBなし）＋ TypeScript。手法データはAstro Content Collections（YAMLデータ＋Zodスキーマ）で管理し、スキーマで§5の手法エンティティを強制する。詳細ページはデータを受け取る純粋なAstroコンポーネントで描画し、Vitest（Container API）でテストする。動的UI（検索・チャート・関係マップ）は後続Planでreact islandsとして追加する。

**Tech Stack:** Astro 5 / TypeScript / Tailwind CSS v4 / Zod / Vitest / `yaml`（コンテンツ検証テスト用）。React・Observable Plot・Cytoscape.js・Fuse.js は後続Planで導入。

## Global Constraints

これらは全タスクの要件に暗黙的に含まれる。

- 言語は**日本語のみ**。UI文言・コンテンツはすべて日本語。
- **静的サイト**。サーバー・DB・ログイン・ユーザー状態を持たない（read-only）。
- **既定でJSを出さない**。インタラクティブ部分のみ後続Planでreact islands化する。Plan 1にクライアントJSは不要。
- 手法コンテンツは**Zodスキーマに必ず適合**させる。スキーマ違反のコンテンツはテストで落とす。
- **難易度**の許容値（verbatim）: `基礎` / `初級` / `中級` / `上級` / `高度`
- **関係タイプ**の許容値（verbatim）: `類似` / `比較対象` / `前提` / `発展` / `併用` / `前処理` / `後処理` / `代替` / `補完`
- **分析目的カテゴリ（15・verbatim）**: `傾向を知りたい` / `ばらつきを知りたい` / `関係性を知りたい` / `影響要因を知りたい` / `予測したい` / `分類したい` / `グループ分けしたい` / `似ているものを探したい` / `異常を見つけたい` / `変化を見つけたい` / `ランキングしたい` / `最適化したい` / `要約したい` / `次元を減らしたい` / `構造を見つけたい`
- **データ種類カテゴリ（11・verbatim）**: `数値データ` / `カテゴリデータ` / `時系列データ` / `テキストデータ` / `画像データ` / `ログデータ` / `売上・購買データ` / `アンケートデータ` / `位置情報データ` / `ネットワークデータ` / `多次元データ`
- **数学・統計カテゴリ（15・verbatim）**: `基礎統計` / `確率・分布` / `統計的検定` / `回帰分析` / `分類` / `クラスタリング` / `次元削減` / `ベクトル・距離・類似度` / `行列` / `微分・積分・最適化` / `時系列解析` / `異常検知` / `ネットワーク分析` / `テキスト分析` / `ソート・ランキング`
- コンテンツは**段階拡張**。Plan 1ではスキーマ確立と代表2件の執筆までを行い、残りの手法は後続のコンテンツ制作で追加する。v1骨格の完成を手法100件に依存させない。
- 手法ファイルの`id`は**ASCIIスラッグ**（例: `mean`, `median`）。日本語名は`name`フィールドに保持。`related[].id`はスラッグで参照する。

---

## File Structure（このPlanで作成/変更するファイル）

- `package.json` — 依存とスクリプト
- `astro.config.mjs` — Astro設定（Tailwind Viteプラグイン）
- `tsconfig.json` — TypeScript設定（Astro strict）
- `vitest.config.ts` — Astro連携のVitest設定
- `src/styles/global.css` — Tailwindエントリ
- `src/content/schema.ts` — **手法エンティティのZodスキーマ＋分類タクソノミー定数**（このPlanの中核・単体テスト対象）
- `src/content.config.ts` — Content Collections定義（`schema.ts`を利用）
- `src/content/methods/mean.yaml` — 手法コンテンツ（平均）
- `src/content/methods/median.yaml` — 手法コンテンツ（中央値）
- `src/layouts/BaseLayout.astro` — 共通レイアウト
- `src/components/SampleTable.astro` — ミニ例表の描画
- `src/components/MethodDetail.astro` — §4テンプレートの描画（純粋・props受け取り・テスト対象）
- `src/pages/methods/[id].astro` — 手法詳細ページ（静的生成）
- `src/pages/index.astro` — 暫定トップ（手法一覧リンク。本格版はPlan 2）
- `tests/schema.test.ts` — スキーマ単体テスト
- `tests/content.test.ts` — コンテンツ検証＋参照整合テスト
- `tests/method-detail.test.ts` — 詳細コンポーネントのContainerテスト
- `tests/fixtures/sample-method.ts` — テスト用の正しい手法データ1件

---

## Task 1: プロジェクト基盤（Astro + TS + Tailwind + Vitest）

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/styles/global.css`, `src/pages/index.astro`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Consumes: なし（greenfield）
- Produces: `npm run dev` / `npm run build` / `npm test` が動く土台。後続タスクはこの上でファイルを追加する。

- [ ] **Step 1: 依存をインストール**

Run:
```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --skip-houston
npm install
npm install -D tailwindcss @tailwindcss/vite vitest zod yaml
```
Expected: `package.json` と `src/` が生成され、依存が入る。`.` に既存の `README.md` がある場合はテンプレ生成を許可（上書きされるのは Astro 既定ファイルのみ。`README.md` は残す）。

- [ ] **Step 2: `package.json` のスクリプトを設定**

`package.json` の `scripts` を以下にする（他のフィールドは生成物のまま）:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: `astro.config.mjs` を設定（Tailwind Viteプラグイン）**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Tailwindエントリと共通レイアウトの土台を作る**

```css
/* src/styles/global.css */
@import "tailwindcss";
```

```astro
---
// src/pages/index.astro
import '../styles/global.css';
---
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI時代のデータ分析手法カタログ</title>
  </head>
  <body class="bg-white text-gray-900">
    <main class="mx-auto max-w-3xl p-8">
      <h1 class="text-2xl font-bold">AI時代のデータ分析手法カタログ</h1>
      <p class="mt-2 text-gray-600">準備中。手法ページはPlan 2でナビゲーションを整備します。</p>
    </main>
  </body>
</html>
```

- [ ] **Step 5: Vitest設定（Astro連携）**

```ts
// vitest.config.ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 6: スモークテストを書く**

```ts
// tests/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: テストとビルドを実行して確認**

Run:
```bash
npm test
npm run build
```
Expected: `npm test` で `smoke.test.ts` がPASS。`npm run build` が成功し `dist/index.html` が生成される。

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "chore: scaffold Astro + TypeScript + Tailwind + Vitest"
```

---

## Task 2: 手法エンティティのZodスキーマとタクソノミー定数

**Files:**
- Create: `src/content/schema.ts`
- Create: `tests/fixtures/sample-method.ts`
- Test: `tests/schema.test.ts`

**Interfaces:**
- Consumes: `zod`
- Produces:
  - `PURPOSE_CATEGORIES`, `DATA_CATEGORIES`, `MATH_CATEGORIES`, `DIFFICULTIES`, `RELATION_TYPES`（`readonly string[]`、verbatim値）
  - `methodSchema`（Zodオブジェクト。`content.config.ts` とコンテンツ検証テストが利用）
  - `type Method = z.infer<typeof methodSchema>`
  - `sampleMethod: Method`（テスト用フィクスチャ。後続タスクのコンポーネントテストでも利用）

- [ ] **Step 1: 失敗するスキーマテストを書く**

```ts
// tests/schema.test.ts
import { describe, it, expect } from 'vitest';
import { methodSchema } from '../src/content/schema';
import { sampleMethod } from './fixtures/sample-method';

describe('methodSchema', () => {
  it('正しい手法データを受理する', () => {
    expect(() => methodSchema.parse(sampleMethod)).not.toThrow();
  });

  it('不正な難易度を拒否する', () => {
    const bad = { ...sampleMethod, difficulty: '簡単' };
    expect(() => methodSchema.parse(bad)).toThrow();
  });

  it('不正な分析目的カテゴリを拒否する', () => {
    const bad = { ...sampleMethod, purposeCategories: ['存在しない目的'] };
    expect(() => methodSchema.parse(bad)).toThrow();
  });

  it('不正な関係タイプを拒否する', () => {
    const bad = {
      ...sampleMethod,
      related: [{ id: 'median', type: 'にている' }],
    };
    expect(() => methodSchema.parse(bad)).toThrow();
  });

  it('必須項目の欠落を拒否する（oneLinerなし）', () => {
    const { oneLiner, ...bad } = sampleMethod;
    expect(() => methodSchema.parse(bad)).toThrow();
  });
});
```

- [ ] **Step 2: テスト用フィクスチャを書く**

```ts
// tests/fixtures/sample-method.ts
export const sampleMethod = {
  name: '平均',
  reading: 'へいきん',
  english: 'Mean',
  summary: '数値をすべて足して個数で割った代表値。',
  oneLiner: 'データ全体をならすと1個あたりどれくらいかを表す値。',
  analogy: 'クラス全員の点を合計して人数で割ると平均点が出る。',
  whatYouLearn: 'データ全体の中心的な水準が分かる。',
  suitableData: ['数値データ（売上、点数、金額など）'],
  suitablePurposes: ['全体の代表値を知りたい'],
  inputData: '1列の数値が並んだデータ。1行が1件に対応する。',
  sampleTable: {
    caption: '例：5人の点数',
    columns: ['生徒', '点数'],
    rows: [
      ['Aさん', '60'],
      ['Bさん', '70'],
    ],
  },
  results: 'データ全体を代表する1つの数値。',
  howToRead: '平均80点なら全体の中心は約80点。全員が80点という意味ではない。',
  beforeAfter: {
    before: '点数がバラバラで全体水準がつかめない。',
    after: '全体の中心は約80点と一言で言える。',
  },
  whenToUse: ['全体のおおまかな水準を一言で示したいとき'],
  whenNotToUse: ['外れ値が混じるとき'],
  cautions: ['外れ値に弱い。1つの極端な値で大きく動く。'],
  related: [
    { id: 'median', type: '比較対象', note: '外れ値に強い代表値。' },
  ],
  aiPromptExample:
    'このデータの平均を出し、全体の水準を一言で説明してください。',
  difficulty: '基礎',
  tags: ['基礎統計', '解釈しやすい'],
  keywords: ['平均', 'mean', 'average', '代表値'],
  purposeCategories: ['傾向を知りたい', '要約したい'],
  dataCategories: ['数値データ'],
  mathCategories: ['基礎統計'],
  formula: '平均 = (x₁ + … + xₙ) / n',
};
```

- [ ] **Step 3: テストを実行して失敗を確認**

Run: `npx vitest run tests/schema.test.ts`
Expected: FAIL（`src/content/schema.ts` が存在せずインポート解決に失敗）。

- [ ] **Step 4: スキーマとタクソノミー定数を実装**

```ts
// src/content/schema.ts
import { z } from 'zod';

export const DIFFICULTIES = ['基礎', '初級', '中級', '上級', '高度'] as const;

export const RELATION_TYPES = [
  '類似', '比較対象', '前提', '発展', '併用',
  '前処理', '後処理', '代替', '補完',
] as const;

export const PURPOSE_CATEGORIES = [
  '傾向を知りたい', 'ばらつきを知りたい', '関係性を知りたい', '影響要因を知りたい',
  '予測したい', '分類したい', 'グループ分けしたい', '似ているものを探したい',
  '異常を見つけたい', '変化を見つけたい', 'ランキングしたい', '最適化したい',
  '要約したい', '次元を減らしたい', '構造を見つけたい',
] as const;

export const DATA_CATEGORIES = [
  '数値データ', 'カテゴリデータ', '時系列データ', 'テキストデータ', '画像データ',
  'ログデータ', '売上・購買データ', 'アンケートデータ', '位置情報データ',
  'ネットワークデータ', '多次元データ',
] as const;

export const MATH_CATEGORIES = [
  '基礎統計', '確率・分布', '統計的検定', '回帰分析', '分類', 'クラスタリング',
  '次元削減', 'ベクトル・距離・類似度', '行列', '微分・積分・最適化', '時系列解析',
  '異常検知', 'ネットワーク分析', 'テキスト分析', 'ソート・ランキング',
] as const;

const sampleTableSchema = z.object({
  caption: z.string().optional(),
  columns: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())),
});

// サンプル分布チャートの指定。実際の描画はPlan 5で行う。
const sampleChartSchema = z.object({
  type: z.enum(['histogram', 'scatter', 'box', 'line', 'bar', 'heatmap']),
  caption: z.string().optional(),
  // データ系列。チャート種別ごとの解釈はPlan 5のチャートコンポーネントが担う。
  series: z.array(z.object({
    label: z.string().optional(),
    points: z.array(z.array(z.number())),
  })),
});

const relationSchema = z.object({
  id: z.string(),
  type: z.enum(RELATION_TYPES),
  note: z.string().optional(),
});

export const methodSchema = z.object({
  // 識別
  name: z.string(),
  reading: z.string(),
  english: z.string(),
  // 理解の核
  summary: z.string(),
  oneLiner: z.string(),
  analogy: z.string(),
  // 用途・データ
  whatYouLearn: z.string(),
  suitableData: z.array(z.string()).min(1),
  suitablePurposes: z.array(z.string()).min(1),
  inputData: z.string(),
  sampleTable: sampleTableSchema,
  sampleChart: sampleChartSchema.optional(),
  // 結果
  results: z.string(),
  howToRead: z.string(),
  beforeAfter: z.object({ before: z.string(), after: z.string() }),
  // 使い分け・注意
  whenToUse: z.array(z.string()).min(1),
  whenNotToUse: z.array(z.string()).min(1),
  cautions: z.array(z.string()).min(1),
  // つながり・補助
  related: z.array(relationSchema),
  aiPromptExample: z.string(),
  // メタ
  difficulty: z.enum(DIFFICULTIES),
  tags: z.array(z.string()),
  keywords: z.array(z.string()),
  purposeCategories: z.array(z.enum(PURPOSE_CATEGORIES)).min(1),
  dataCategories: z.array(z.enum(DATA_CATEGORIES)).min(1),
  mathCategories: z.array(z.enum(MATH_CATEGORIES)).min(1),
  // 任意
  formula: z.string().optional(),
});

export type Method = z.infer<typeof methodSchema>;
```

- [ ] **Step 5: テストを実行して成功を確認**

Run: `npx vitest run tests/schema.test.ts`
Expected: PASS（5件すべて）。

- [ ] **Step 6: コミット**

```bash
git add src/content/schema.ts tests/schema.test.ts tests/fixtures/sample-method.ts
git commit -m "feat: add typed method entity schema and taxonomy constants"
```

---

## Task 3: Content Collections定義と代表手法2件＋コンテンツ検証

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/methods/mean.yaml`, `src/content/methods/median.yaml`
- Test: `tests/content.test.ts`

**Interfaces:**
- Consumes: `methodSchema`（Task 2）
- Produces: `methods` コレクション（後続の詳細ページ・一覧が `getCollection('methods')` で参照）。各エントリ `id` はファイル名スラッグ。

- [ ] **Step 1: 失敗するコンテンツ検証テストを書く**

全YAMLをスキーマ検証し、`related[].id` が実在することを確認する（参照整合）。

```ts
// tests/content.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { methodSchema } from '../src/content/schema';

const DIR = join(process.cwd(), 'src/content/methods');

function loadAll() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));
  return files.map((f) => ({
    id: f.replace(/\.yaml$/, ''),
    data: parse(readFileSync(join(DIR, f), 'utf-8')),
  }));
}

describe('method content', () => {
  const entries = loadAll();

  it('少なくとも2件の手法がある', () => {
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('すべての手法がスキーマに適合する', () => {
    for (const e of entries) {
      expect(() => methodSchema.parse(e.data), `${e.id} が不適合`).not.toThrow();
    }
  });

  it('related[].id がすべて実在する（参照整合）', () => {
    const ids = new Set(entries.map((e) => e.id));
    for (const e of entries) {
      for (const rel of e.data.related ?? []) {
        expect(ids.has(rel.id), `${e.id} -> ${rel.id} が未定義`).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認**

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL（`src/content/methods` が存在しない、または手法0件）。

- [ ] **Step 3: 代表手法2件を執筆（mean / median、相互に比較対象で参照）**

```yaml
# src/content/methods/mean.yaml
name: 平均
reading: へいきん
english: Mean (Arithmetic Mean)
summary: 数値データをすべて足して個数で割った、データ全体を代表する1つの値。
oneLiner: データ全体を「ならすと1個あたりどれくらいか」を表す代表値。
analogy: クラス全員のテスト点を合計して人数で割ると平均点が出る。みんなの点を平らに均（なら）すといくつになるか、というイメージ。
whatYouLearn: データ全体の中心的な水準が分かる。「だいたいこのくらい」という基準値が得られ、他の期間やグループと比較する土台になる。
suitableData:
  - 数値データ（売上、点数、回数、金額など）
suitablePurposes:
  - 全体の傾向・代表値を知りたい
inputData: 1列の数値が並んだデータ。1行が1件（例：1人、1日、1商品）に対応する。
sampleTable:
  caption: 例：5人の小テストの点数
  columns: ["生徒", "点数"]
  rows:
    - ["Aさん", "60"]
    - ["Bさん", "70"]
    - ["Cさん", "80"]
    - ["Dさん", "90"]
    - ["Eさん", "100"]
sampleChart:
  type: bar
  caption: 5人の点数。平均は80点。
  series:
    - label: 点数
      points: [[1, 60], [2, 70], [3, 80], [4, 90], [5, 100]]
results: データ全体を代表する1つの数値（この例では80点）。全体としてどのくらいの水準かを一言で表せる。
howToRead: 平均80点なら「全体の中心はおよそ80点」。ただし全員が80点という意味ではなく、低い人も高い人もいる。極端な値があると平均はそちらに引っ張られる。
beforeAfter:
  before: 点数がバラバラに並んでいるだけで、全体としての水準がつかめない。
  after: 「全体の中心は約80点」と一言で言え、他クラスや前回との比較ができる。
whenToUse:
  - データ全体のおおまかな水準を一言で示したいとき
  - 複数のグループや期間を同じ土俵で比較したいとき
whenNotToUse:
  - 極端に大きい/小さい値（外れ値）が混じるとき。中央値の方が実態に近い。
  - 一部に極端に偏った分布のとき
cautions:
  - 外れ値に弱い。1つの極端な値で平均が大きく動く。
  - 「平均＝典型的な1件」ではない。ばらつき（標準偏差など）も併せて見る。
related:
  - id: median
    type: 比較対象
    note: 外れ値に強い代表値。平均と併せて見ると分布の偏りが分かる。
aiPromptExample: このデータの平均を計算し、全体の水準を一言でまとめてください。外れ値の影響があれば指摘してください。
difficulty: 基礎
tags: ["基礎統計", "解釈しやすい"]
keywords: ["平均", "mean", "average", "代表値", "算術平均"]
purposeCategories: ["傾向を知りたい", "要約したい"]
dataCategories: ["数値データ"]
mathCategories: ["基礎統計"]
formula: 平均 = (x₁ + x₂ + … + xₙ) / n
```

```yaml
# src/content/methods/median.yaml
name: 中央値
reading: ちゅうおうち
english: Median
summary: データを小さい順に並べたとき、ちょうど真ん中に来る値。
oneLiner: 大きさ順に並べて「まん中」に位置する値。外れ値に強い代表値。
analogy: 年収の高い人が数人いる集団で「真ん中の人の年収」を見るイメージ。一部の大金持ちに引っ張られない。
whatYouLearn: 極端な値の影響を受けにくい「代表的な真ん中」の水準が分かる。平均とズレていれば分布の偏りが見える。
suitableData:
  - 数値データ。特に外れ値や偏りがあるデータ（年収、価格など）
suitablePurposes:
  - 外れ値に左右されない代表値を知りたい
inputData: 1列の数値が並んだデータ。1行が1件に対応する。
sampleTable:
  caption: 例：5件の年収（万円）
  columns: ["人", "年収"]
  rows:
    - ["A", "300"]
    - ["B", "350"]
    - ["C", "400"]
    - ["D", "450"]
    - ["E", "5000"]
results: 真ん中に位置する1つの数値（この例では400）。平均（約1300）より実態に近い代表値になる。
howToRead: 中央値400・平均1300のように大きくズレるときは、一部の極端な大きい値が平均を押し上げているサイン。実感に近いのは中央値。
beforeAfter:
  before: 平均だけ見て「年収1300万が普通」と誤解しかねない。
  after: 中央値400を見て「多くの人は400前後」と実態をつかめる。
whenToUse:
  - 外れ値や偏りが大きいデータの代表値を示したいとき
  - 平均と比べて分布の偏りを確認したいとき
whenNotToUse:
  - 全データの合計や総量が重要なとき（中央値からは総量が出ない）
  - 左右対称でばらつきが小さいデータ（平均でほぼ十分）
cautions:
  - 合計・総量の情報は失われる。総額が知りたい用途には不向き。
  - データ件数が偶数のときは真ん中2つの平均を取る、という定義を意識する。
related:
  - id: mean
    type: 比較対象
    note: 外れ値に弱い代表値。中央値と併せて分布の偏りを判断する。
aiPromptExample: このデータの中央値を出し、平均との差から分布の偏り（外れ値の影響）を説明してください。
difficulty: 基礎
tags: ["基礎統計", "解釈しやすい", "少量データでも可"]
keywords: ["中央値", "median", "代表値", "ロバスト"]
purposeCategories: ["傾向を知りたい", "要約したい"]
dataCategories: ["数値データ"]
mathCategories: ["基礎統計"]
formula: 並べ替えたデータ x₍₁₎ ≤ … ≤ x₍ₙ₎ の中央位置の値
```

- [ ] **Step 4: Content Collections定義を作る**

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { methodSchema } from './content/schema';

const methods = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/methods' }),
  schema: methodSchema,
});

export const collections = { methods };
```

- [ ] **Step 5: テストとビルドを実行して成功を確認**

Run:
```bash
npx vitest run tests/content.test.ts
npm run build
```
Expected: コンテンツテスト3件PASS。`npm run build` 成功（Astroのコンテンツ検証も通る）。

- [ ] **Step 6: コミット**

```bash
git add src/content.config.ts src/content/methods tests/content.test.ts
git commit -m "feat: add methods content collection with mean and median entries"
```

---

## Task 4: 手法詳細ページの描画（§4テンプレート）

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SampleTable.astro`
- Create: `src/components/MethodDetail.astro`
- Create: `src/pages/methods/[id].astro`
- Modify: `src/pages/index.astro`（手法へのリンク一覧に差し替え）
- Test: `tests/method-detail.test.ts`

**Interfaces:**
- Consumes: `Method` 型（Task 2）、`methods` コレクション（Task 3）、`sampleMethod` フィクスチャ（Task 2）
- Produces: `MethodDetail`（`{ method: Method }` を受け取る純粋コンポーネント）、`/methods/<id>` 静的ページ。

- [ ] **Step 1: 失敗するContainerテストを書く**

`MethodDetail` をフィクスチャで描画し、§4の主要セクション見出しと中身が出ることを確認する。

```ts
// tests/method-detail.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MethodDetail from '../src/components/MethodDetail.astro';
import { sampleMethod } from './fixtures/sample-method';

describe('MethodDetail', () => {
  it('§4の主要セクションと内容を描画する', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MethodDetail, {
      props: { method: sampleMethod },
    });

    // ヘッダ
    expect(html).toContain('平均');
    expect(html).toContain('へいきん');
    expect(html).toContain('基礎'); // 難易度バッジ
    // 各セクション見出し
    expect(html).toContain('これは何');
    expect(html).toContain('何が分かる');
    expect(html).toContain('どんなデータを用意する');
    expect(html).toContain('どんな時に使う');
    expect(html).toContain('結果の読み方');
    expect(html).toContain('使う前');
    expect(html).toContain('注意点');
    expect(html).toContain('関連手法');
    // 中身
    expect(html).toContain(sampleMethod.analogy);
    expect(html).toContain(sampleMethod.whatYouLearn);
    expect(html).toContain('生徒'); // ミニ例表の列見出し
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認**

Run: `npx vitest run tests/method-detail.test.ts`
Expected: FAIL（`MethodDetail.astro` が存在しない）。

- [ ] **Step 3: 共通レイアウトを実装**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
interface Props { title: string }
const { title } = Astro.props;
---
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body class="bg-white text-gray-900">
    <main class="mx-auto max-w-3xl p-6 md:p-8">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 4: ミニ例表コンポーネントを実装**

```astro
---
// src/components/SampleTable.astro
import type { Method } from '../content/schema';
interface Props { table: Method['sampleTable'] }
const { table } = Astro.props;
---
<figure class="my-4">
  {table.caption && <figcaption class="mb-2 text-sm text-gray-600">{table.caption}</figcaption>}
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr>
        {table.columns.map((c) => (
          <th class="border-b border-gray-300 px-3 py-2 text-left font-semibold">{c}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {table.rows.map((row) => (
        <tr>
          {row.map((cell) => (
            <td class="border-b border-gray-100 px-3 py-2">{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</figure>
```

- [ ] **Step 5: 詳細コンポーネントを実装（§4テンプレート）**

注: サンプル分布チャート（`sampleChart`）の描画はPlan 5で追加する。本Planでは未描画。

```astro
---
// src/components/MethodDetail.astro
import type { Method } from '../content/schema';
import SampleTable from './SampleTable.astro';
interface Props { method: Method }
const { method } = Astro.props;
---
<article class="space-y-8">
  <header class="space-y-2">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h1 class="text-3xl font-bold">{method.name}</h1>
      <span class="text-gray-500">{method.reading}</span>
      <span class="text-gray-500">/ {method.english}</span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <span class="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
        難易度: {method.difficulty}
      </span>
      {method.tags.map((t) => (
        <span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{t}</span>
      ))}
    </div>
    <p class="text-sm text-gray-500">
      目的: {method.purposeCategories.join(' / ')}　|　データ: {method.dataCategories.join(' / ')}　|　分類: {method.mathCategories.join(' / ')}
    </p>
  </header>

  <section>
    <h2 class="text-xl font-bold">これは何？</h2>
    <p class="mt-2 font-medium">{method.oneLiner}</p>
    <p class="mt-2 text-gray-700">たとえ：{method.analogy}</p>
  </section>

  <section>
    <h2 class="text-xl font-bold">何が分かる？</h2>
    <p class="mt-2 text-gray-700">{method.whatYouLearn}</p>
  </section>

  <section>
    <h2 class="text-xl font-bold">どんなデータを用意する？</h2>
    <p class="mt-2 text-gray-700">{method.inputData}</p>
    <SampleTable table={method.sampleTable} />
  </section>

  <section>
    <h2 class="text-xl font-bold">どんな時に使う／使わない方がいい時</h2>
    <div class="mt-2 grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="font-semibold text-emerald-700">使うべき場面</h3>
        <ul class="mt-1 list-disc pl-5 text-gray-700">
          {method.whenToUse.map((x) => <li>{x}</li>)}
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-rose-700">使わない方がいい場面</h3>
        <ul class="mt-1 list-disc pl-5 text-gray-700">
          {method.whenNotToUse.map((x) => <li>{x}</li>)}
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-xl font-bold">結果の読み方</h2>
    <p class="mt-2 text-gray-700">{method.howToRead}</p>
  </section>

  <section>
    <h2 class="text-xl font-bold">使う前 → 後</h2>
    <div class="mt-2 grid gap-4 md:grid-cols-2">
      <div class="rounded border border-gray-200 p-3">
        <h3 class="text-sm font-semibold text-gray-500">使う前</h3>
        <p class="mt-1 text-gray-700">{method.beforeAfter.before}</p>
      </div>
      <div class="rounded border border-indigo-200 bg-indigo-50 p-3">
        <h3 class="text-sm font-semibold text-indigo-600">使った後</h3>
        <p class="mt-1 text-gray-700">{method.beforeAfter.after}</p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-xl font-bold">注意点</h2>
    <ul class="mt-2 list-disc pl-5 text-gray-700">
      {method.cautions.map((x) => <li>{x}</li>)}
    </ul>
  </section>

  <section>
    <h2 class="text-xl font-bold">関連手法（次に見る）</h2>
    <ul class="mt-2 space-y-1">
      {method.related.map((rel) => (
        <li>
          <a class="text-indigo-700 underline" href={`/methods/${rel.id}`}>{rel.id}</a>
          <span class="ml-2 text-xs text-gray-500">[{rel.type}]</span>
          {rel.note && <span class="ml-2 text-gray-600">{rel.note}</span>}
        </li>
      ))}
    </ul>
  </section>

  <section class="rounded bg-gray-50 p-4">
    <h2 class="text-sm font-bold text-gray-600">AIへの頼み方の一文例</h2>
    <p class="mt-1 text-gray-700">{method.aiPromptExample}</p>
  </section>

  {method.formula && (
    <details class="text-sm text-gray-600">
      <summary class="cursor-pointer">参考：数式</summary>
      <p class="mt-2">{method.formula}</p>
    </details>
  )}
</article>
```

- [ ] **Step 6: テストを実行して成功を確認**

Run: `npx vitest run tests/method-detail.test.ts`
Expected: PASS。

- [ ] **Step 7: 詳細ページ（静的生成）と暫定トップを実装**

```astro
---
// src/pages/methods/[id].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import MethodDetail from '../../components/MethodDetail.astro';

export async function getStaticPaths() {
  const methods = await getCollection('methods');
  return methods.map((m) => ({ params: { id: m.id }, props: { method: m.data } }));
}

const { method } = Astro.props;
---
<BaseLayout title={`${method.name} | データ分析手法カタログ`}>
  <p class="mb-4"><a class="text-indigo-700 underline" href="/">← 一覧へ</a></p>
  <MethodDetail method={method} />
</BaseLayout>
```

```astro
---
// src/pages/index.astro
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
const methods = await getCollection('methods');
---
<BaseLayout title="AI時代のデータ分析手法カタログ">
  <h1 class="text-2xl font-bold">AI時代のデータ分析手法カタログ</h1>
  <p class="mt-2 text-gray-600">数学・統計の知識ゼロでも、手法が「何が分かり・どんなデータが要り・いつ使うか」を理解できるカタログです。（ナビゲーションはPlan 2で整備）</p>
  <ul class="mt-6 space-y-2">
    {methods.map((m) => (
      <li>
        <a class="text-indigo-700 underline" href={`/methods/${m.id}`}>{m.data.name}</a>
        <span class="ml-2 text-sm text-gray-500">{m.data.oneLiner}</span>
      </li>
    ))}
  </ul>
</BaseLayout>
```

- [ ] **Step 8: 全テストとビルドを実行して確認**

Run:
```bash
npm test
npm run build
```
Expected: 全テストPASS。`dist/methods/mean/index.html` と `dist/methods/median/index.html` が生成される。

- [ ] **Step 9: コミット**

```bash
git add -A
git commit -m "feat: render method detail pages from typed content"
```

---

## Self-Review（このPlanのカバレッジ確認・記録）

- **spec §4（詳細テンプレート）**: ヘッダ/これは何/何が分かる/データ+ミニ例表/使う時・使わない時/結果の読み方/ビフォーアフター/注意点/関連手法/AI一文例/数式 → Task 4で描画。**サンプル分布チャート（§4-5）は本Planではデータをスキーマに保持し描画はPlan 5**（意図的な範囲分割）。
- **spec §5.1（エンティティ）**: Task 2のZodスキーマで全必須項目＋主要任意項目を表現。
- **spec §5.2（3軸タクソノミー）/ §5.3（9関係）/ §5.4（難易度）**: Task 2の定数＋スキーマで強制。値はGlobal Constraintsにverbatim。
- **spec §7.1（段階拡張）**: Task 3は代表2件のみ。残りはコンテンツ制作で追加（骨格は手法数に依存しない）。
- プレースホルダなし。各stepに実コードとコマンド・期待結果あり。
- 型整合: `methodSchema` / `Method` / `sampleMethod` をTask 2で定義し、Task 3・4が一貫して参照。

---

## v1 マイルストーン・ロードマップ（Plan 2以降）

各Planは「動作する・テスト可能なソフトウェア」を単体で生む。完了ごとに本Planと同じ粒度のTDD計画として展開する。

- **Plan 2 — ナビゲーションと分類ハブ**: 「目的から探す」を主役にしたトップ、3軸（目的/データ種類/カテゴリ）のハブページ、難易度を含む手法カード、ルーティング。
- **Plan 3 — 検索と難易度フィルタ（最初のreact island）**: `@astrojs/react` 導入、ビルド時の検索索引生成、Fuse.jsによる横断検索＋ファセット絞り込み。
- **Plan 4 — 手法比較ビュー**: 同じ目的の複数手法を「向くデータ/得られる結果/難易度/注意点」で横並び比較。
- **Plan 5 — サンプル分布チャート**: Observable Plotのreact islandで `sampleChart` を描画し詳細ページに統合（ヒストグラム/散布図/箱ひげ図など）。
- **Plan 6 — 関係マップ（アトラス）**: Cytoscape.jsのreact islandで手法関係グラフを可視化。詳細ページからの「周辺を見る」＋全体俯瞰。
- **Plan 7 — 共通注意ページ＋仕上げ**: 横断的注意喚起の静的ページ、SEO/メタ情報、アクセシビリティ、レスポンシブ仕上げ。
- **コンテンツ制作（並行トラック）**: §7.2の代表約36件をテンプレに沿って執筆 → フェーズ2で100件以上へ。
