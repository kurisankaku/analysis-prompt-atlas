# 共通注意ページ＋仕上げ 実装計画（Plan 7 / v1 マイルストーン7）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** 横断的な「共通の注意喚起」ページを追加し、SEO/メタ情報・404・アクセシビリティを整え、これまでの計画で持ち越した軽微課題をクリーンアップして v1 機能面を完成させる。

**Architecture:** 静的Astro。`/cautions` は要件§17.1の共通注意を一覧する静的ページ。`BaseLayout` に `description` を足しメタ情報を強化。`/404` を追加。アトラスの関係色・トップの不要アンカー等の持ち越し課題を解消。

**Tech Stack:** Astro 5 / TS strict / Tailwind v4 / Vitest（クライアントJS不要）。

## Global Constraints
- 言語は**日本語のみ**、静的サイト、**クライアントJS不要**（island は依然 /search の1つのみを維持）。
- スタイルは **Tailwind v4** ＋ `@theme` トークン。生hex・既定gray/indigoで代替しない。
- 既存テスト（50件）を壊さない。`npx astro check` 0エラー、`npm run build` 成功を維持。

## File Structure
- `src/pages/cautions.astro` — 共通注意ページ（要件§17.1の12項目）。
- `src/components/SiteFooter.astro` — **修正**：「共通の注意点」リンクを `/cautions` に接続。
- `src/layouts/BaseLayout.astro` — **修正**：`description?: string` を受け取り `<meta name="description">`／OGタグを出力。
- 各主要ページ — **任意修正**：`description` を渡す（トップ・手法詳細・/search・/atlas）。
- `src/pages/404.astro` — 404ページ。
- `src/styles/global.css` — **修正**：`--color-good` トークン追加（アトラスの 併用 エッジ色）。
- `src/components/AtlasGraph.astro` — **修正**：併用エッジを `var(--color-good)` に。
- `src/pages/index.astro` — **修正**：不要な `id="diff"` アンカーと陳腐化TODOの整理。
- `tests/components.test.ts` — BaseLayout/Cautions の最小テスト追記。

---

## Task 1: 共通注意ページ `/cautions`

**Files:** Create `src/pages/cautions.astro`; Modify `src/components/SiteFooter.astro`; Test add to `tests/components.test.ts`（任意：小さなデータ駆動なら不要）

**Interfaces:** Consumes `BaseLayout`. 静的コンテンツ。

要件§17.1の共通注意（12項目）を、見出し＋短い補足で一覧する。データは配列で持つ：
```
相関は因果を意味しない / 外れ値が結果に大きく影響することがある / 欠損値の扱いで結果が変わる /
データの偏りで結果が歪む / サンプルサイズが小さいと信頼性が下がる / 過学習に注意 /
正規化・標準化が必要な手法がある / カテゴリ変数の扱いに注意 / 時系列は時間順序を壊さない /
高次元では距離の意味が薄れることがある / 検定は多重比較に注意 / AIの分析結果は必ず検証する
```

- [ ] **Step 1: ページを実装（テスト先行可）**
`cautions.astro`：フロントマターに `const CAUTIONS = [{ title, body }, ...]`（12件、各 body は1〜2文の平易な補足）。`BaseLayout`（`title="共通の注意点"`、`description="データ分析でつまずきやすい共通の注意点（相関と因果、外れ値、過学習など）"`）内に、見出し＋カード/リストで描画。`@theme` トークン使用。各項目に注意アイコン（モックの caution 風）。
- [ ] **Step 2: フッター接続**
`SiteFooter.astro` の「共通の注意点」リンク（現在 `#` の TODO）を `/cautions` に。
- [ ] **Step 3: 最小テスト（Container）**
`tests/components.test.ts` に、`cautions.astro` は Astro ページ（getStaticPaths 不要）なので Container で `BaseLayout` 経由は重い → 代わりに **ビルド検証**でよい（下記 Step 4）。コンポーネント化する場合のみテスト。簡潔に保つため、ここはビルド検証で代替する。
- [ ] **Step 4: ビルド検証 ＋ コミット**
Run: `npm run build` → `dist/cautions/index.html` に「相関は因果を意味しない」「過学習」「AIの分析結果は必ず検証」等が含まれ、フッターの当該リンクが `/cautions` を指すこと。`npx astro check` 0エラー、`npm test` 50件green。
```bash
git add src/pages/cautions.astro src/components/SiteFooter.astro
git commit -m "feat: add common-cautions page and wire footer link"
```

---

## Task 2: メタ情報（SEO）と 404

**Files:** Modify `src/layouts/BaseLayout.astro`; Create `src/pages/404.astro`; （任意）主要ページに `description` を付与; Test add to `tests/components.test.ts`

**Interfaces:** `BaseLayout` Props に `description?: string` を追加。

- [ ] **Step 1: BaseLayout のメタ拡張（テスト先行）**
`tests/components.test.ts` に BaseLayout の Container テスト（`title` と `description` を渡し、`<meta name="description" content="...">` と `<meta property="og:title">` が出ることを確認）。注: BaseLayout は `<html>` ごと描画するので Container でも検証可。`<slot>` にはダミーを渡す。
- [ ] **Step 2: 実装**
`BaseLayout.astro` に `description?: string` を足し、`<head>` に `<meta name="description" content={description}>`（あれば）、`<meta property="og:title" content={title}>`、`<meta property="og:description" content={description}>`、`<meta property="og:type" content="website">`、`<meta name="viewport" ...>`（既存）を出力。`<html lang="ja">` は維持。アクセシビリティ：本文先頭へのスキップリンク（`<a href="#main" class="sr-only focus:...">本文へ</a>`）と `<main id="main">` を追加（`@theme` トークン、`sr-only` 相当ユーティリティ）。
- [ ] **Step 3: 404 ページ**
`src/pages/404.astro`：`BaseLayout` 内に「ページが見つかりません」＋トップ/目的一覧への導線。
- [ ] **Step 4: 主要ページに description 付与（任意・軽微）**
トップ・/search・/atlas・手法詳細（`[id].astro`）に簡潔な `description` を渡す（手法詳細は `method.oneLiner` を使う）。
- [ ] **Step 5: 成功 ＋ ビルド ＋ コミット**
Run: `npx vitest run tests/components.test.ts` → PASS。`npm run build` → `dist/404.html` 生成、`dist/methods/mean/index.html` に description メタが出ること。`npx astro check` 0、`npm test` 全green。
```bash
git add src/layouts/BaseLayout.astro src/pages/404.astro src/pages/index.astro src/pages/search.astro src/pages/atlas.astro src/pages/methods tests/components.test.ts
git commit -m "feat: add meta/description, OG tags, skip-link, and 404 page"
```

---

## Task 3: 持ち越し課題のクリーンアップ

**Files:** Modify `src/styles/global.css`, `src/components/AtlasGraph.astro`, `src/pages/index.astro`; Test add to `tests/components.test.ts`

- [ ] **Step 1: `--color-good` トークンを追加し、アトラスの 併用 エッジに適用**
`global.css` の `@theme` に `--color-good: #2F7A5B;`（モックの good 色）を追加。`AtlasGraph.astro` の `edgeStyle('併用')` を `var(--color-water)` から `var(--color-good)` に変更（凡例の 比較対象 と 併用 が別色になる）。
- [ ] **Step 2: AtlasGraph の hex-freedom テストを追記**
`tests/components.test.ts` の AtlasGraph テストに `expect(html).not.toMatch(/#[0-9A-Fa-f]{3,6}\b/)` を追加（生hexが無いこと）。
- [ ] **Step 3: トップの不要アンカー・陳腐化TODOを整理**
`index.astro`：ヘッダーや他から参照されない `id="diff"` ラッパー（難易度サブ入口は `/search` へ遷移するため不要）を削除。Plan 3 完了で意味が変わった `TODO(Plan 3)` コメント（ヒーローのタブ/検索入力）を実態に合わせて更新（「/search が機能を担う」旨）。`#data`/`#cat` はヘッダー副入口から参照され得るため残す。
- [ ] **Step 4: 成功 ＋ ビルド ＋ コミット**
Run: `npm test` → 全green（AtlasGraph hex テスト含む）。`npm run build` → 成功。`npx astro check` 0。islandは依然 /search の1つのみ（`grep -rl astro-island dist`）。
```bash
git add src/styles/global.css src/components/AtlasGraph.astro src/pages/index.astro tests/components.test.ts
git commit -m "chore: add --color-good for atlas edges, harden tests, clean stale anchors/TODOs"
```

---

## Self-Review（カバレッジ）
- spec §17.1（共通注意喚起）→ Task 1（/cautions）。
- spec §21（探索・発見）/一般的SEO → Task 2（description/OG/404/スキップリンク）。
- 持ち越しMinor（アトラス色・不要アンカー・陳腐化TODO・hexテスト）→ Task 3。
- クライアントJSを増やさない（静的のまま）。既存テスト維持。
- プレースホルダ無し。

## v1 完成後
**コンテンツ制作**：現在2件（平均/中央値）の手法を、要件§19のフェーズ1代表手法（約30〜40件）へ拡充する。各手法は既存スキーマに適合し、`tests/content.test.ts`（スキーマ検証＋参照整合）と `astro check` で検証される。プラットフォーム（Plan 1〜7）はこの拡充を前提に設計済み。
