# 手法比較ビュー 実装計画（Plan 4 / v1 マイルストーン4）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** 同じ軸（目的／データ種類／数学カテゴリ）に属する複数手法を、測量データシート風の表で横並び比較できる比較ページを実装する。

**Architecture:** 静的Astro。軸の各エントリのうち**手法が2件以上**あるものに対して `/<axis>/<slug>/compare` を静的生成。`ComparisonTable.astro` が手法配列を受け取り、行＝比較項目・列＝手法 の表を描画。ハブページの「比較」ボタンは2件以上のときだけ表示し、比較ページへリンク。モック `mockup/compare.html` を `@theme` トークンで再現。

**Tech Stack:** Astro 5 / TS strict / Tailwind v4 / Vitest（クライアントJSは不要・静的）。

## Global Constraints
- 言語は**日本語のみ**、静的サイト、**クライアントJS不要**（比較は静的表）。
- スタイルは **Tailwind v4** ＋ `@theme` トークン（`text-ink`/`-soft`/`-faint`、`bg-card`/`bg-paper2`、`border-line`/`-strong`、`text-signal`、`font-display`/`-mono`）。難易度バッジは `difficultyBadgeClass`。Tailwind既定 gray/indigo・生hexで代替しない。
- 比較対象は**同じ軸の同じエントリに属する手法**。比較が成立するのは**2件以上**のときのみ。1件以下の軸には比較ページを作らず、ハブの比較ボタンも出さない（リンク切れを作らない）。
- 比較行は既存スキーマのフィールドのみを使う（スキーマは変更しない）：一言説明 / 向いているデータ / 得られる結果 / 難易度 / 注意点。
- モック `mockup/compare.html` のデータシート表現（行キー列＋手法列、横スクロール可）を再現。

## File Structure
- `src/components/ComparisonTable.astro` — 比較表（props: `{ items: { id: string; data: Method }[] }`）。中核。
- `src/pages/purpose/[slug]/compare.astro` — 目的軸の比較ページ。
- `src/pages/data/[slug]/compare.astro` — データ種類軸。
- `src/pages/category/[slug]/compare.astro` — 数学カテゴリ軸。
- `src/components/HubView.astro` — **修正**：`compareHref?: string` プロップを追加し、与えられたときだけ「比較」ボタンを表示（リンク先＝比較ページ）。
- 各ハブページ（`purpose/[slug].astro` ほか）— **修正**：`items.length >= 2` のとき `compareHref` を計算して `HubView` に渡す。
- `tests/components.test.ts` — `ComparisonTable` の Container テストを追記。

---

## Task 1: ComparisonTable コンポーネント

**Files:** Create `src/components/ComparisonTable.astro`; Test add to `tests/components.test.ts`

**Interfaces:**
- Consumes: `Method`、`difficultyBadgeClass`
- Produces: `ComparisonTable`（props: `{ items: { id: string; data: Method }[] }`）。行＝比較項目（一言説明／向いているデータ／得られる結果／難易度／注意点）、列＝各手法（手法名＋詳細リンク）。`items` は2件以上を前提（呼び出し側が保証）。

- [ ] **Step 1: 失敗するテストを書く**
```ts
// tests/components.test.ts （追記）
import ComparisonTable from '../src/components/ComparisonTable.astro';

describe('ComparisonTable', () => {
  it('各手法を列に、比較項目を行に描画する', async () => {
    const c = await AstroContainer.create();
    const items = [
      { id: 'mean', data: sampleMethod },
      { id: 'median', data: { ...sampleMethod, name: '中央値', oneLiner: '真ん中の値', difficulty: '初級' } },
    ];
    const html = await c.renderToString(ComparisonTable, { props: { items } });
    // 手法名（列見出し）と詳細リンク
    expect(html).toContain('平均');
    expect(html).toContain('中央値');
    expect(html).toContain('/methods/mean');
    expect(html).toContain('/methods/median');
    // 行ラベル
    expect(html).toContain('一言でいうと');
    expect(html).toContain('向いているデータ');
    expect(html).toContain('得られる結果');
    expect(html).toContain('難易度');
    expect(html).toContain('注意点');
    // 値
    expect(html).toContain(sampleMethod.oneLiner);
    expect(html).toContain('真ん中の値');
  });
});
```
注: `tests/components.test.ts` は Container テストの集合。既存 import（`AstroContainer`, `sampleMethod`）を流用する。

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: 実装する（モック `compare.html` 準拠）**
`<table>` を `overflow-x-auto` のラッパで包み、`thead` に手法名（＋詳細リンク）、`tbody` の各行に比較項目。行: 一言でいうと=`oneLiner` / 向いているデータ=`suitableData.join('、')` / 得られる結果=`results` / 難易度=`difficultyBadgeClass(difficulty)` のバッジ / 注意点=`cautions.join('、')`（または箇条書き）。`@theme` トークンで装飾。最小幅＋横スクロールでモバイル対応。

- [ ] **Step 4: 実行して成功を確認** → PASS。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/components/ComparisonTable.astro tests/components.test.ts
git commit -m "feat: add ComparisonTable (datasheet of methods)"
```

---

## Task 2: 比較ページと「比較」ボタンの接続

**Files:** Create `src/pages/purpose/[slug]/compare.astro`, `src/pages/data/[slug]/compare.astro`, `src/pages/category/[slug]/compare.astro`; Modify `src/components/HubView.astro` and the 3 hub pages (`purpose/[slug].astro`, `data/[slug].astro`, `category/[slug].astro`).

**Interfaces:**
- Consumes: `ComparisonTable`、`PURPOSES`/`DATA_TYPES`/`MATH_CATS`、`methodsByPurpose/Data/Math`、`allMethods()`、`BaseLayout`
- Produces:
  - 比較ページ（各軸）。`getStaticPaths` は **手法が2件以上あるエントリのみ** を返す（`items.length >= 2`）。`items` を `ComparisonTable` に渡す。見出しに軸ラベル＋エントリ名＋「N件を比較」。ハブへ戻る導線。
  - `HubView` に `compareHref?: string`。与えられたとき `.hub-head` に「比較」ボタン（`href={compareHref}`）を表示。無いとき非表示。
  - 各ハブページは `items.length >= 2 ? `/<axis>/<slug>/compare` : undefined` を `compareHref` として `HubView` に渡す。

- [ ] **Step 1: HubView に compareHref を追加**
`HubView.astro` の Props に `compareHref?: string` を足し、`.hub-head` のツール領域に `{compareHref && <a href={compareHref} class="...btn...">この軸の手法を比較</a>}` を置く（モックの比較ボタン風、`@theme` トークン）。既存の HubView テスト（filled/empty）は壊さない（compareHref を渡さなければボタンは出ない）。

- [ ] **Step 2: 比較ページを実装（purpose 例）**
```astro
---
// src/pages/purpose/[slug]/compare.astro
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ComparisonTable from '../../../components/ComparisonTable.astro';
import { PURPOSES, methodsByPurpose } from '../../../lib/taxonomy';
import { allMethods } from '../../../lib/methods';

export async function getStaticPaths() {
  const all = await allMethods();
  return PURPOSES
    .map((p) => ({ p, items: all.filter((m) => methodsByPurpose([m.data], p.label).length > 0) }))
    .filter(({ items }) => items.length >= 2)
    .map(({ p, items }) => ({ params: { slug: p.slug }, props: { entry: p, items } }));
}
const { entry, items } = Astro.props;
---
<BaseLayout title={`${entry.label}の手法を比較 | 分析手法アトラス`} active="目的から">
  <p class="mt-4 mb-2 font-mono text-sm text-ink-faint"><a class="underline" href={`/purpose/${entry.slug}`}>← {entry.label}</a></p>
  <h1 class="font-display text-2xl font-bold">「{entry.label}」の手法を比較（{items.length}件）</h1>
  <ComparisonTable items={items} />
</BaseLayout>
```
`data/[slug]/compare.astro`（`DATA_TYPES`/`methodsByData`、active「データ種類」）と `category/[slug]/compare.astro`（`MATH_CATS`/`methodsByMath`、active「分類」）も同型で実装。

- [ ] **Step 3: ハブページに compareHref を渡す**
`purpose/[slug].astro` の `getStaticPaths` で各エントリの `items` を計算済み（Plan 2）。`compareHref` を `items.length >= 2 ? `/purpose/${p.slug}/compare` : undefined` として props に追加し、ページ本体で `<HubView ... compareHref={compareHref} />`。`data`/`category` も同様。

- [ ] **Step 4: ビルドで検証**
Run: `npm run build` → 手法2件以上の軸（`/purpose/trend/compare`、`/purpose/summarize/compare`、`/data/numeric/compare`、`/category/basic-stats/compare`）の比較ページが生成され、平均・中央値が列に並ぶこと。1件以下の軸（例 `/purpose/relationship/compare`）は**生成されない**こと（`ls dist/purpose/relationship/compare` が無い）。該当ハブ（trend 等）のページに「比較」ボタンが出て、件数<2のハブ（relationship 等）には出ないこと。`npx astro check` 0エラー、`npm test` 全green。

- [ ] **Step 5: コミット**
```bash
git add src/pages/purpose src/pages/data src/pages/category src/components/HubView.astro
git commit -m "feat: add per-axis comparison pages and wire hub compare button"
```

---

## Self-Review（カバレッジ）
- spec §3.1 #4（比較ビュー：同じ目的の複数手法を横並び）→ Task 1/2（目的＋データ＋カテゴリの3軸に一般化）。
- spec §20（同じ目的に使える複数手法を比較できる）→ 充足。
- リンク切れ防止：比較ページは2件以上のエントリのみ生成、ボタンも条件表示。
- スキーマ変更なし（既存フィールドで比較）。
- プレースホルダ無し。型整合（`{id,data}[]` を ComparisonTable・ページで一貫使用）。

## 次の Plan
Plan 5 サンプル分布チャート／Plan 6 関係マップ／Plan 7 共通注意＋仕上げ／コンテンツ制作。
