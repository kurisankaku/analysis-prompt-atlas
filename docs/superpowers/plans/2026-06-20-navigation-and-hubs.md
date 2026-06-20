# ナビゲーションと分類ハブ 実装計画（Plan 2 / v1 マイルストーン2）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 「目的から探す」を主役にしたトップページ、3軸（目的／データ種類／数学カテゴリ）の分類ハブ、手法カード、共通ヘッダー／フッターを実装し、手法へ多軸で到達できるようにする。

**Architecture:** 静的Astro。`src/lib/taxonomy.ts` が3軸の分類定義（slug↔ラベル↔説明）と「手法を軸で絞り込む」ヘルパーを提供。トップと各ハブページは `getCollection('methods')` ＋ taxonomy から静的生成。見た目は承認済みモック `mockup/index.html`・`mockup/hub.html` を Tailwind `@theme` トークンで再現。

**Tech Stack:** Astro 5 / TypeScript strict / Tailwind v4 / Vitest。クライアントJSはまだ無し（検索・難易度フィルタの React island は Plan 3）。

## Global Constraints

全タスクの要件に暗黙的に含まれる。

- 言語は**日本語のみ**。**静的サイト**（サーバー/DB/ログインなし）。**Plan 2 もクライアントJSを出さない**（インタラクティブな検索・難易度フィルタは Plan 3）。
- スタイルは **Tailwind CSS v4**。モック（`mockup/index.html`・`mockup/hub.html`・`mockup/styles.css`）の見た目を正とし、色・フォントは `src/styles/global.css` の `@theme` トークン（`text-ink` / `text-ink-soft` / `text-ink-faint` / `bg-card` / `bg-paper2` / `border-line` / `border-line-strong` / `text-signal` / `text-water` / `text-gold` / `font-display` / `font-body` / `font-latin` / `font-mono`）を使う。Tailwind既定の gray/indigo 等や生hex直書きで代替しない（バッジ等モックに無い色味のみ例外）。
- **分類ラベルは Plan 1 の統制語彙（`src/content/schema.ts`）と完全一致**させる（verbatim）。目的15・データ種類11・数学カテゴリ15。taxonomy のラベルがスキーマの enum と1文字でも違えば不整合。
- **slug は ASCII**。URLは `/purpose/<slug>` `/data/<slug>` `/category/<slug>`。
- 手法が0件の軸でもハブページは生成し、空状態メッセージ「該当する手法はまだありません。」を出す（リンク切れを作らない）。
- 「主役の入口＝目的から探す」。トップは目的15領域を主役に提示し、データ種類・分類・難易度・検索（ボタンのみ・実体はPlan 3）を副入口として併設。
- コンテンツは現状2件（mean/median）。件数表示・ハブ一覧は**コレクションから動的に算出**する（モックのハードコード値を写さない）。

---

## File Structure

- `src/lib/taxonomy.ts` — 3軸の分類定義（`PURPOSES`/`DATA_TYPES`/`MATH_CATS`：各 `{slug,label,description}`）＋ `getAxis`、`methodsInPurpose/Data/Math` 等のヘルパー。中核・テスト対象。
- `src/lib/methods.ts` — `getCollection('methods')` の薄いラッパ（全件取得・件数）。Astroランタイム依存のためテストは taxonomy 側で純粋部分を検証。
- `src/components/SiteHeader.astro` — 共通ヘッダー（ブランド＋ナビ＋検索ボタン）。モック `.site-header`。
- `src/components/SiteFooter.astro` — 共通フッター。モック `.site-footer`。
- `src/components/RegionCard.astro` — 目的領域カード（モック `.region`：R番号・件数・ラベル・説明）。
- `src/components/MethodCard.astro` — 手法カード（モック `.entry`：名前・読み/コード・一言・難易度・データタグ）。
- `src/components/SubEntryCard.astro` — 副入口カード（モック `.subcard`）。
- `src/layouts/BaseLayout.astro` — **修正**：`SiteHeader`/`SiteFooter` を組み込み、`<slot/>` を `main.wrap` で包む。
- `src/pages/index.astro` — **全面改修**：トップ（ヒーロー＋目的15領域グリッド＋副入口）。モック `index.html`。
- `src/pages/purpose/[slug].astro` — 目的ハブ。
- `src/pages/data/[slug].astro` — データ種類ハブ。
- `src/pages/category/[slug].astro` — 数学カテゴリハブ。
- `tests/taxonomy.test.ts` — taxonomy 定義・整合・絞り込みの単体テスト。
- `tests/components.test.ts` — RegionCard / MethodCard / SiteHeader の Container テスト。

各ハブページは同じ「ハブ表示部品」を共有する。重複を避けるため、ハブの中身（見出し＋手法カード列／空状態）は `src/components/HubView.astro`（props: `{ axisLabel, code, title, description, methods }`）に切り出す。

- `src/components/HubView.astro` — ハブ共通表示（モック `hub.html` の `.hub-head` ＋ `.entry-grid`）。3つのハブページから利用。

---

## Task 1: 分類タクソノミー・モジュール

**Files:**
- Create: `src/lib/taxonomy.ts`
- Test: `tests/taxonomy.test.ts`

**Interfaces:**
- Consumes: `PURPOSE_CATEGORIES` / `DATA_CATEGORIES` / `MATH_CATEGORIES` / `Method` from `../content/schema`
- Produces:
  - `type TaxoEntry = { slug: string; label: string; description: string }`
  - `PURPOSES: TaxoEntry[]`（15・順序＝R01..R15）、`DATA_TYPES: TaxoEntry[]`（11）、`MATH_CATS: TaxoEntry[]`（15）
  - `purposeBySlug(slug): TaxoEntry | undefined`（同様に data/math）
  - `methodsByPurpose(methods: Method[], label: string): Method[]`（data/math 版も）
  - `countByLabel(methods, axisField, label): number`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// tests/taxonomy.test.ts
import { describe, it, expect } from 'vitest';
import { PURPOSES, DATA_TYPES, MATH_CATS, purposeBySlug, methodsByPurpose } from '../src/lib/taxonomy';
import { PURPOSE_CATEGORIES, DATA_CATEGORIES, MATH_CATEGORIES } from '../src/content/schema';
import { sampleMethod } from './fixtures/sample-method';

describe('taxonomy', () => {
  it('各軸の件数が統制語彙と一致する', () => {
    expect(PURPOSES).toHaveLength(15);
    expect(DATA_TYPES).toHaveLength(11);
    expect(MATH_CATS).toHaveLength(15);
  });

  it('ラベルが統制語彙(schema)と完全一致する', () => {
    expect(PURPOSES.map((p) => p.label)).toEqual([...PURPOSE_CATEGORIES]);
    expect(DATA_TYPES.map((d) => d.label)).toEqual([...DATA_CATEGORIES]);
    expect(MATH_CATS.map((m) => m.label)).toEqual([...MATH_CATEGORIES]);
  });

  it('slug は一意でASCII', () => {
    const slugs = [...PURPOSES, ...DATA_TYPES, ...MATH_CATS].map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('全エントリに説明がある', () => {
    for (const e of [...PURPOSES, ...DATA_TYPES, ...MATH_CATS]) expect(e.description.length).toBeGreaterThan(0);
  });

  it('purposeBySlug が引ける', () => {
    expect(purposeBySlug('relationship')?.label).toBe('関係性を知りたい');
    expect(purposeBySlug('nope')).toBeUndefined();
  });

  it('methodsByPurpose が目的ラベルで絞り込む', () => {
    const methods = [sampleMethod] as any;
    expect(methodsByPurpose(methods, '傾向を知りたい')).toHaveLength(1);
    expect(methodsByPurpose(methods, '異常を見つけたい')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 実行して失敗を確認**
Run: `npx vitest run tests/taxonomy.test.ts` → FAIL（`src/lib/taxonomy.ts` 未作成）。

- [ ] **Step 3: 実装する**

ラベルは schema の enum と完全一致させること（verbatim）。説明は目的＝モック `index.html` の領域カード文言、データ／数学＝簡潔な一文。

```ts
// src/lib/taxonomy.ts
import type { Method } from '../content/schema';

export type TaxoEntry = { slug: string; label: string; description: string };

export const PURPOSES: TaxoEntry[] = [
  { slug: 'trend', label: '傾向を知りたい', description: 'データ全体の傾向や中心の水準をつかむ。平均・中央値・トレンド。' },
  { slug: 'spread', label: 'ばらつきを知りたい', description: '散らばり・偏りを見る。標準偏差・四分位範囲・箱ひげ図。' },
  { slug: 'relationship', label: '関係性を知りたい', description: '変数どうしの結びつきを調べる。相関・回帰・クロス集計。' },
  { slug: 'factor', label: '影響要因を知りたい', description: '結果に効いている要因を探す。重回帰・決定木・特徴量重要度。' },
  { slug: 'predict', label: '予測したい', description: '未来や未知の値を見積もる。回帰・時系列予測・勾配ブースティング。' },
  { slug: 'classify', label: '分類したい', description: '既知のカテゴリに振り分ける。ロジスティック回帰・SVM・決定木。' },
  { slug: 'cluster', label: 'グループ分けしたい', description: 'ラベルなしで自然なまとまりに。k-means・階層クラスタリング。' },
  { slug: 'similarity', label: '似ているものを探したい', description: '類似度・距離で近いものを。コサイン類似度・ベクトル検索。' },
  { slug: 'anomaly', label: '異常を見つけたい', description: '通常と違うデータを検出。z-score・Isolation Forest・管理図。' },
  { slug: 'change', label: '変化を見つけたい', description: '時間や順序に沿った変化を。差分・移動平均・変化点検出。' },
  { slug: 'ranking', label: 'ランキングしたい', description: '順位づけ・スコアリング。加重平均・偏差値・PageRank。' },
  { slug: 'optimize', label: '最適化したい', description: '最も良い組合せ・条件を探す。線形計画法・勾配降下法・ベイズ最適化。' },
  { slug: 'summarize', label: '要約したい', description: '少数の指標で代表させる。代表値・主成分分析・トピックモデル。' },
  { slug: 'reduce', label: '次元を減らしたい', description: '多くの変数を少数の軸へ。PCA・t-SNE・UMAP・特徴選択。' },
  { slug: 'structure', label: '構造を見つけたい', description: 'つながりや構造を可視化。ネットワーク分析・コミュニティ検出。' },
];

export const DATA_TYPES: TaxoEntry[] = [
  { slug: 'numeric', label: '数値データ', description: '売上・点数・金額などの連続した数値。' },
  { slug: 'categorical', label: 'カテゴリデータ', description: '性別・地域などの区分（ラベル）。' },
  { slug: 'timeseries', label: '時系列データ', description: '時間順に並ぶデータ。' },
  { slug: 'text', label: 'テキストデータ', description: '文章・コメント・自由記述。' },
  { slug: 'image', label: '画像データ', description: '写真・図などの画像。' },
  { slug: 'log', label: 'ログデータ', description: '行動・アクセスなどの記録。' },
  { slug: 'sales', label: '売上・購買データ', description: '購買・取引の記録。' },
  { slug: 'survey', label: 'アンケートデータ', description: '回答・評価のデータ。' },
  { slug: 'geo', label: '位置情報データ', description: '緯度経度・地点のデータ。' },
  { slug: 'network', label: 'ネットワークデータ', description: 'つながり・関係のデータ。' },
  { slug: 'multidim', label: '多次元データ', description: '多数の変数を持つデータ。' },
];

export const MATH_CATS: TaxoEntry[] = [
  { slug: 'basic-stats', label: '基礎統計', description: '平均・分散など基本の要約。' },
  { slug: 'probability', label: '確率・分布', description: '確率と分布の考え方。' },
  { slug: 'testing', label: '統計的検定', description: '差や関係が偶然かを判定。' },
  { slug: 'regression', label: '回帰分析', description: '関係を式にして予測する。' },
  { slug: 'classification', label: '分類', description: 'カテゴリへの振り分け。' },
  { slug: 'clustering', label: 'クラスタリング', description: '自然なまとまりを見つける。' },
  { slug: 'dim-reduction', label: '次元削減', description: '変数を少数の軸へ圧縮。' },
  { slug: 'vector-distance', label: 'ベクトル・距離・類似度', description: '近さ・類似を測る。' },
  { slug: 'matrix', label: '行列', description: '行列を使った解析。' },
  { slug: 'calculus-opt', label: '微分・積分・最適化', description: '変化と最適化の数学。' },
  { slug: 'timeseries-analysis', label: '時系列解析', description: '時間データの分析。' },
  { slug: 'anomaly-detection', label: '異常検知', description: '外れた点の検出。' },
  { slug: 'network-analysis', label: 'ネットワーク分析', description: 'つながりの分析。' },
  { slug: 'text-analysis', label: 'テキスト分析', description: '文章の分析。' },
  { slug: 'sort-ranking', label: 'ソート・ランキング', description: '並べ替え・順位づけ。' },
];

const bySlug = (arr: TaxoEntry[]) => (slug: string) => arr.find((e) => e.slug === slug);
export const purposeBySlug = bySlug(PURPOSES);
export const dataBySlug = bySlug(DATA_TYPES);
export const mathBySlug = bySlug(MATH_CATS);

export function methodsByPurpose(methods: Method[], label: string): Method[] {
  return methods.filter((m) => m.purposeCategories.includes(label as Method['purposeCategories'][number]));
}
export function methodsByData(methods: Method[], label: string): Method[] {
  return methods.filter((m) => m.dataCategories.includes(label as Method['dataCategories'][number]));
}
export function methodsByMath(methods: Method[], label: string): Method[] {
  return methods.filter((m) => m.mathCategories.includes(label as Method['mathCategories'][number]));
}
```

- [ ] **Step 4: 実行して成功を確認**
Run: `npx vitest run tests/taxonomy.test.ts` → PASS（6件）。

- [ ] **Step 5: コミット**
```bash
git add src/lib/taxonomy.ts tests/taxonomy.test.ts
git commit -m "feat: add taxonomy module for 3-axis navigation"
```

---

## Task 2: 共通ヘッダー／フッターとレイアウト統合

**Files:**
- Create: `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`
- Modify: `src/layouts/BaseLayout.astro`（ヘッダー/フッターを差し込み、`<slot/>` を `main.wrap` で包む。既存の `methods/[id].astro` が `BaseLayout` を使うため、二重ヘッダーにならないよう注意：詳細ページ側で重複していたヘッダーマークアップがあれば BaseLayout 由来に一本化する）
- Test: `tests/components.test.ts`（SiteHeader 部分）

**Interfaces:**
- Consumes: なし（静的）
- Produces: `SiteHeader`（props: `{ active?: string }` で現在ナビをハイライト）、`SiteFooter`、更新後 `BaseLayout`（props: `{ title: string; active?: string }`）

**デザイン基準:** モック `mockup/index.html` の `.site-header`（ブランドマークSVG＋「分析手法アトラス / Analysis Atlas」＋ナビ「目的から/データ種類/分類/難易度/関係マップ」＋検索ボタン）と `.site-footer` を Tailwind `@theme` トークンで再現する。検索ボタンと「関係マップ」リンクは Plan 3/6 で機能するが、Plan 2 ではボタンは静的（`type="button"`、機能なし）、関係マップは `/atlas`（未実装なら `#` で可、ただしTODOコメント）。モバイルのメニュートグルは Plan 3（JS）に回し、Plan 2 ではナビは常時表示（レスポンシブで折り返し）でよい。

- [ ] **Step 1: SiteHeader の Container テストを書く（失敗）**

```ts
// tests/components.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SiteHeader from '../src/components/SiteHeader.astro';

describe('SiteHeader', () => {
  it('ブランドと主要ナビを描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SiteHeader, { props: {} });
    expect(html).toContain('分析手法アトラス');
    expect(html).toContain('目的から');
    expect(html).toContain('データ種類');
    expect(html).toContain('分類');
    expect(html).toContain('関係マップ');
    expect(html).toContain('href="/"'); // ブランド/目的ホームへのリンク
  });
});
```

- [ ] **Step 2: 実行して失敗を確認**
Run: `npx vitest run tests/components.test.ts` → FAIL（SiteHeader 未作成）。

- [ ] **Step 3: SiteHeader / SiteFooter を実装（モック準拠・theme トークン）**
モックの該当マークアップを Tailwind ユーティリティ＋ `@theme` トークンで再現。ナビ項目: 目的から→`/`、データ種類→`/#data`、分類→`/#cat`、難易度→`/#diff`、関係マップ→`/atlas`。`active` が一致する項目に下線（`border-b-2 border-signal`）。

- [ ] **Step 4: BaseLayout に統合**
`BaseLayout.astro` を更新し、`<body class="bg-paper text-ink font-body">` 直下に `<SiteHeader active={active} />`、`<slot/>` を包む `<main class="wrap">`、末尾に `<SiteFooter />` を置く。`wrap` 相当（`mx-auto max-w-[1120px] px-6`）はユーティリティで表現。`methods/[id].astro` が独自にヘッダー類を描いている場合は削除し BaseLayout に委ねる（詳細ページの本文・パンくず・MethodDetail はそのまま）。

- [ ] **Step 5: 実行して成功を確認 ＋ ビルド**
Run: `npx vitest run tests/components.test.ts` → PASS。`npm run build` → 既存ページ（index, methods/*）が引き続き生成され、ヘッダー/フッターが付くこと。`npx astro check` 0エラー維持。

- [ ] **Step 6: コミット**
```bash
git add src/components/SiteHeader.astro src/components/SiteFooter.astro src/layouts/BaseLayout.astro tests/components.test.ts
git commit -m "feat: add shared site header/footer and integrate into layout"
```

---

## Task 3: 手法カード・領域カード・副入口カード

**Files:**
- Create: `src/components/MethodCard.astro`, `src/components/RegionCard.astro`, `src/components/SubEntryCard.astro`
- Test: `tests/components.test.ts`（MethodCard / RegionCard を追記）

**Interfaces:**
- Consumes: `Method`（schema）、`TaxoEntry`（taxonomy）
- Produces:
  - `MethodCard`（props: `{ method: Method }`）— `/methods/<id>` へリンク、名前・読み・一言・難易度バッジ・データタグ
  - `RegionCard`（props: `{ entry: TaxoEntry; code: string; count: number }`）— `/purpose/<slug>` へリンク、R番号・件数・ラベル・説明
  - `SubEntryCard`（props: `{ title: string; href: string; description: string; chips: string[]; dotColor: string }`）

**デザイン基準:** `MethodCard`＝モック `hub.html` の `.entry`。`RegionCard`＝モック `index.html` の `.region`。`SubEntryCard`＝モック `.subcard`。難易度バッジ色は Plan 1 の `MethodDetail` と同じ対応（基礎/初級/中級/上級/高度）。重複を避け、難易度バッジのクラス対応は小さなヘルパー or 既存方針に合わせる（Plan 1 で `MethodDetail` 内に持っていれば、共通化して `src/lib/badges.ts` に切り出し、両者で使う）。

- [ ] **Step 1: テスト追記（失敗）**

```ts
// tests/components.test.ts （追記）
import MethodCard from '../src/components/MethodCard.astro';
import RegionCard from '../src/components/RegionCard.astro';
import { sampleMethod } from './fixtures/sample-method';

describe('MethodCard', () => {
  it('手法名・一言・難易度・詳細リンクを描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodCard, { props: { method: sampleMethod } });
    expect(html).toContain(sampleMethod.name);
    expect(html).toContain(sampleMethod.oneLiner);
    expect(html).toContain(sampleMethod.difficulty);
    expect(html).toContain('/methods/'); // 詳細リンク
  });
});

describe('RegionCard', () => {
  it('R番号・件数・ラベル・説明・目的リンクを描画する', async () => {
    const c = await AstroContainer.create();
    const entry = { slug: 'relationship', label: '関係性を知りたい', description: '変数どうしの結びつきを調べる。' };
    const html = await c.renderToString(RegionCard, { props: { entry, code: 'R03', count: 8 } });
    expect(html).toContain('R03');
    expect(html).toContain('関係性を知りたい');
    expect(html).toContain('8');
    expect(html).toContain('/purpose/relationship');
  });
});
```

注: `MethodCard` は `/methods/<id>` へリンクするが、`Method` には `id` が無い（id はコレクションのキー）。そのため `MethodCard` の props は `{ method: Method; id: string }` とし、テストも `{ method: sampleMethod, id: 'mean' }` を渡し、`expect(html).toContain('/methods/mean')` を検証する。**Step 1 のテストをこの形に修正して書くこと。**

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: 3カードを実装（モック準拠・theme トークン）**
`MethodCard` props は `{ method: Method; id: string }`。難易度バッジは共通ヘルパー（`src/lib/badges.ts` に `difficultyBadgeClass(difficulty)` を切り出し、`MethodDetail` もそれを使うようリファクタ）。

- [ ] **Step 4: 実行して成功を確認** → PASS。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/components/MethodCard.astro src/components/RegionCard.astro src/components/SubEntryCard.astro src/lib/badges.ts src/components/MethodDetail.astro tests/components.test.ts
git commit -m "feat: add method/region/subentry cards with shared badge helper"
```

---

## Task 4: トップページ（目的から探す）

**Files:**
- Modify: `src/pages/index.astro`（Plan 1 の暫定一覧を全面改修）
- Create: `src/lib/methods.ts`（`allMethods()` ＝ `getCollection('methods')` ラッパ）

**Interfaces:**
- Consumes: `RegionCard` / `SubEntryCard`、`PURPOSES`/`DATA_TYPES`/`MATH_CATS`、`methodsByPurpose`、`allMethods()`
- Produces: トップページ。各 `RegionCard` の `code` は `R01..R15`（PURPOSES の並び順 index+1, 2桁ゼロ詰め）、`count` は `methodsByPurpose(all, p.label).length`。

**デザイン基準:** モック `mockup/index.html` のヒーロー（「何を知りたい?」＋リード文）、目的15領域グリッド（`.region-grid`）、副入口（`.subentries`、`#data`/`#cat`/`#diff` アンカー付き）を再現。検索インプットは静的（Plan 3 で機能）。`BaseLayout` を `active="目的から"` で使う。

- [ ] **Step 1: methods ラッパを作る**
```ts
// src/lib/methods.ts
import { getCollection } from 'astro:content';
import type { Method } from '../content/schema';

export async function allMethods(): Promise<{ id: string; data: Method }[]> {
  const entries = await getCollection('methods');
  return entries.map((e) => ({ id: e.id, data: e.data }));
}
```

- [ ] **Step 2: index.astro を改修**
ヒーロー＋ `PURPOSES.map((p, i) => <RegionCard entry={p} code={`R${String(i+1).padStart(2,'0')}`} count={methodsByPurpose(all.map(x=>x.data), p.label).length} />)` ＋副入口3枚。モックの文言・構造に合わせる。

- [ ] **Step 3: ビルドで検証**
Astroページの単体テストは行わず、ビルド成果物で確認する（コンポーネントは Task 3 でテスト済み）。
Run: `npm run build` → 成功。`dist/index.html` を開き／grep し、`R03`・`関係性を知りたい`・`/purpose/relationship`・「何を知りたい?」・副入口アンカー `id="data"` が出ること。`npx astro check` 0エラー。

- [ ] **Step 4: コミット**
```bash
git add src/pages/index.astro src/lib/methods.ts
git commit -m "feat: rebuild top page as purpose-first explorer"
```

---

## Task 5: 分類ハブページ（目的／データ種類／数学カテゴリ）

**Files:**
- Create: `src/components/HubView.astro`
- Create: `src/pages/purpose/[slug].astro`, `src/pages/data/[slug].astro`, `src/pages/category/[slug].astro`
- Test: `tests/components.test.ts`（HubView の空状態・カード描画を追記）

**Interfaces:**
- Consumes: `MethodCard`、`PURPOSES`/`DATA_TYPES`/`MATH_CATS`、`methodsByPurpose/Data/Math`、`allMethods()`
- Produces:
  - `HubView`（props: `{ code: string; axisLabel: string; title: string; description: string; items: { id: string; data: Method }[] }`）— モック `hub.html` の `.hub-head` ＋ `.entry-grid`。`items` が空なら「該当する手法はまだありません。」
  - 3つのハブページ。各 `getStaticPaths` は対応する軸の**全エントリ**を返す（0件でもページ生成）。

- [ ] **Step 1: HubView の Container テスト（失敗）**

```ts
// tests/components.test.ts （追記）
import HubView from '../src/components/HubView.astro';

describe('HubView', () => {
  it('手法があればカードを、なければ空状態を描画する', async () => {
    const c = await AstroContainer.create();
    const withItems = await c.renderToString(HubView, { props: {
      code: 'R03', axisLabel: '分析目的', title: '関係性を知りたい', description: '...',
      items: [{ id: 'mean', data: sampleMethod }],
    }});
    expect(withItems).toContain('関係性を知りたい');
    expect(withItems).toContain(sampleMethod.name);

    const empty = await c.renderToString(HubView, { props: {
      code: 'D05', axisLabel: 'データ種類', title: '画像データ', description: '...', items: [],
    }});
    expect(empty).toContain('該当する手法はまだありません');
  });
});
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: HubView を実装（モック準拠）** ＋ 3つのハブページを実装

各ハブページ例（purpose）:
```astro
---
// src/pages/purpose/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import HubView from '../../components/HubView.astro';
import { PURPOSES, methodsByPurpose } from '../../lib/taxonomy';
import { allMethods } from '../../lib/methods';

export async function getStaticPaths() {
  const all = await allMethods();
  return PURPOSES.map((p, i) => {
    const items = all.filter((m) => methodsByPurpose([m.data], p.label).length > 0);
    return { params: { slug: p.slug }, props: { entry: p, code: `R${String(i + 1).padStart(2, '0')}`, items } };
  });
}
const { entry, code, items } = Astro.props;
---
<BaseLayout title={`${entry.label} | 分析手法アトラス`} active="目的から">
  <HubView code={code} axisLabel="分析目的" title={entry.label} description={entry.description} items={items} />
</BaseLayout>
```
`data/[slug].astro`（`DATA_TYPES`/`methodsByData`、code は `D01..D11`、axisLabel「データ種類」、active「データ種類」）と `category/[slug].astro`（`MATH_CATS`/`methodsByMath`、code `C01..C15`、axisLabel「分類」、active「分類」）も同型で実装。

- [ ] **Step 4: 成功 ＋ ビルド検証**
Run: `npx vitest run tests/components.test.ts` → PASS。`npm run build` → `/purpose/relationship/`・`/purpose/trend/`・`/data/numeric/`・`/category/basic-stats/` 等が生成され、mean/median が `関係性…`ではなく所属する目的（傾向/要約）・数値データ・基礎統計のハブに出ること、空の軸（画像データ等）で空状態が出ること。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/components/HubView.astro src/pages/purpose src/pages/data src/pages/category tests/components.test.ts
git commit -m "feat: add purpose/data/category hub pages with empty states"
```

---

## Self-Review（このPlanのカバレッジ）

- spec §3.2（目的主役のトップ＋副入口）→ Task 4。
- spec §3.1（分類ハブ）→ Task 5（3軸）。
- spec §6（探索：目的/データ/カテゴリ）→ taxonomy（Task 1）＋ハブ（Task 5）。難易度フィルタ・検索・関係マップ・比較・チャートは Plan 3/4/5/6。
- 統制語彙の一致（§5.2）→ Task 1 のテストで強制。
- デザイン→モック準拠（§承認済み）を各UIタスクの基準に明記。
- プレースホルダ無し（ロジック・データ・テストは実コード、提示物はモックを正とする）。
- 型整合：`Method`/`TaxoEntry`/`allMethods()` を全タスクで一貫使用。`MethodCard` props は `{ method, id }`。

## 次の Plan（ロードマップ再掲）
Plan 3 検索＋難易度フィルタ（React island 初導入）／Plan 4 比較ビュー／Plan 5 サンプル分布チャート／Plan 6 関係マップ／Plan 7 共通注意ページ＋仕上げ／コンテンツ制作（代表手法の拡充）。
