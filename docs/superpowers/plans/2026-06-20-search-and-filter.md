# 検索と難易度フィルタ 実装計画（Plan 3 / v1 マイルストーン3）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** ビルド時に生成した検索インデックスを使い、キーワード検索＋難易度フィルタを行う `/search` ページを React island（初のクライアントJS）として実装する。

**Architecture:** 静的Astro＋部分的ハイドレーション。`@astrojs/react` を導入。`src/lib/search.ts` がビルド時インデックス生成（`buildSearchIndex`）と純粋な検索関数（`searchMethods`、Fuse.js）を提供（＝テスト容易）。`/search` ページが `allMethods()` からインデックスを作り、props で React island `SearchApp` に渡す。Fuse はクライアントで実行。検索ロジックは純関数として単体テスト、React部分は薄く保つ。

**Tech Stack:** Astro 5 / TS strict / Tailwind v4 / Vitest / **@astrojs/react** / **react・react-dom** / **fuse.js**。テスト用に **jsdom** ＋ **@testing-library/react**。

## Global Constraints
- 言語は**日本語のみ**、静的サイト。**Plan 3 で初めてクライアントJSを導入**するが、`client:*` は `SearchApp` の1箇所に限定する（他は静的のまま）。
- スタイルは **Tailwind v4** ＋ `@theme` トークン（`text-ink`/`-soft`/`-faint`、`bg-card`/`bg-paper2`、`border-line`/`-strong`、`text-signal`、`font-display`/`-mono` 等）。Tailwind既定 gray/indigo・生hexで代替しない（難易度バッジ tint は `src/lib/badges.ts` の既存ヘルパーを使う）。
- **難易度の値は統制語彙**（`基礎`/`初級`/`中級`/`上級`/`高度`、`src/content/schema.ts` の `DIFFICULTIES`）。フィルタUIはこれらを使う。
- 検索対象フィールド: 手法名・読み・英語名・一言説明・キーワード（＋所属ラベルは表示/補助）。
- 検索ロジックは**純関数**として実装・テストする（React コンポーネントにロジックを埋めない）。
- React コンポーネントは `.tsx`。Astro コンポーネント（MethodCard 等）は island 内では使えないため、結果行は React で描画（デザインは MethodCard と一貫させる）。

## File Structure
- `astro.config.mjs` — **修正**：`@astrojs/react` integration 追加。
- `src/lib/search.ts` — `SearchDoc` 型、`buildSearchIndex(methods)`、`searchMethods(docs, {query, difficulties})`。中核・テスト対象。
- `src/components/SearchApp.tsx` — React island（検索入力＋難易度ピル＋結果一覧）。
- `src/pages/search.astro` — `/search` ページ（index 生成 → `<SearchApp client:load docs={...} />`）。
- `src/components/SiteHeader.astro` — **修正**：検索ボタンを `/search` への遷移に、`難易度`ナビを `/search` に。
- `src/pages/index.astro` — **修正**：難易度サブ入口カードを `/search` に。
- `tests/search.test.ts` — `buildSearchIndex`・`searchMethods` の単体テスト。
- `tests/search-app.test.tsx` — `SearchApp` の最小レンダリングテスト（jsdom）。

---

## Task 1: React 統合とツールチェーン

**Files:** Modify `astro.config.mjs`; Modify `package.json`; Create `tests/react-smoke.test.tsx`

**Interfaces:** Produces a working `.tsx` + React-island toolchain and jsdom test env for later tasks.

- [ ] **Step 1: 依存を追加**
Run:
```bash
npx astro add react --yes
npm install fuse.js
npm install -D jsdom @testing-library/react @testing-library/dom
```
`npx astro add react` は `@astrojs/react`・`react`・`react-dom`・`@types/react`・`@types/react-dom` を入れ、`astro.config.mjs` に integration を追加し `tsconfig` に jsx 設定を入れる。非対話で進める。

- [ ] **Step 2: jsdom スモークテスト（失敗→成功）**
```tsx
// tests/react-smoke.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function Hello() { return <p>検索準備OK</p>; }

describe('react toolchain', () => {
  it('renders a component in jsdom', () => {
    render(<Hello />);
    expect(screen.getByText('検索準備OK')).toBeTruthy();
  });
});
```

- [ ] **Step 3: 実行**
Run: `npx vitest run tests/react-smoke.test.tsx` → PASS。`npm run build` → 既存44ページが引き続き生成（まだ island は無い）。`npx astro check` → 0エラー。

- [ ] **Step 4: コミット**
```bash
git add astro.config.mjs package.json package-lock.json tsconfig.json tests/react-smoke.test.tsx
git commit -m "chore: add React integration, fuse.js, and jsdom test env"
```

---

## Task 2: 検索インデックスと純粋検索関数

**Files:** Create `src/lib/search.ts`; Test `tests/search.test.ts`

**Interfaces:**
- Consumes: `Method`（schema）
- Produces:
  - `type SearchDoc = { id: string; name: string; reading: string; english: string; oneLiner: string; keywords: string[]; difficulty: Method['difficulty']; purposes: string[]; dataTypes: string[]; categories: string[] }`
  - `buildSearchIndex(methods: { id: string; data: Method }[]): SearchDoc[]`
  - `searchMethods(docs: SearchDoc[], opts: { query: string; difficulties: string[] }): SearchDoc[]`

- [ ] **Step 1: 失敗するテストを書く**
```ts
// tests/search.test.ts
import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchMethods } from '../src/lib/search';
import { sampleMethod } from './fixtures/sample-method';

const docs = buildSearchIndex([
  { id: 'mean', data: sampleMethod },
  { id: 'median', data: { ...sampleMethod, name: '中央値', reading: 'ちゅうおうち', english: 'Median', oneLiner: '真ん中の値', keywords: ['median', '中央値'], difficulty: '初級' } as any },
]);

describe('buildSearchIndex', () => {
  it('必要フィールドを写す', () => {
    const d = docs.find((x) => x.id === 'mean')!;
    expect(d.name).toBe('平均');
    expect(d.difficulty).toBe('基礎');
    expect(d.keywords).toContain('mean');
  });
});

describe('searchMethods', () => {
  it('空クエリは全件（難易度フィルタなし）', () => {
    expect(searchMethods(docs, { query: '', difficulties: [] })).toHaveLength(2);
  });
  it('読み・英語・名前でヒットする', () => {
    expect(searchMethods(docs, { query: 'へいきん', difficulties: [] }).map((d) => d.id)).toContain('mean');
    expect(searchMethods(docs, { query: 'median', difficulties: [] }).map((d) => d.id)).toContain('median');
    expect(searchMethods(docs, { query: '平均', difficulties: [] }).map((d) => d.id)).toContain('mean');
  });
  it('難易度フィルタで絞り込む', () => {
    expect(searchMethods(docs, { query: '', difficulties: ['初級'] }).map((d) => d.id)).toEqual(['median']);
  });
  it('該当なしは空配列', () => {
    expect(searchMethods(docs, { query: 'xyzzy該当しない', difficulties: [] })).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: 実装する**
```ts
// src/lib/search.ts
import Fuse from 'fuse.js';
import type { Method } from '../content/schema';

export type SearchDoc = {
  id: string; name: string; reading: string; english: string; oneLiner: string;
  keywords: string[]; difficulty: Method['difficulty'];
  purposes: string[]; dataTypes: string[]; categories: string[];
};

export function buildSearchIndex(methods: { id: string; data: Method }[]): SearchDoc[] {
  return methods.map(({ id, data }) => ({
    id, name: data.name, reading: data.reading, english: data.english, oneLiner: data.oneLiner,
    keywords: data.keywords, difficulty: data.difficulty,
    purposes: data.purposeCategories, dataTypes: data.dataCategories, categories: data.mathCategories,
  }));
}

export function searchMethods(docs: SearchDoc[], opts: { query: string; difficulties: string[] }): SearchDoc[] {
  const byDifficulty = (d: SearchDoc) => opts.difficulties.length === 0 || opts.difficulties.includes(d.difficulty);
  const q = opts.query.trim();
  if (!q) return docs.filter(byDifficulty);
  const fuse = new Fuse(docs, {
    keys: ['name', 'reading', 'english', 'oneLiner', 'keywords'],
    threshold: 0.4, ignoreLocation: true,
  });
  return fuse.search(q).map((r) => r.item).filter(byDifficulty);
}
```

- [ ] **Step 4: 実行して成功を確認** → PASS。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/lib/search.ts tests/search.test.ts
git commit -m "feat: add build-time search index and pure search function"
```

---

## Task 3: SearchApp React island

**Files:** Create `src/components/SearchApp.tsx`; Test `tests/search-app.test.tsx`

**Interfaces:**
- Consumes: `SearchDoc`、`searchMethods`、`difficultyBadgeClass`（badges）、`DIFFICULTIES`（schema）
- Produces: `SearchApp`（props: `{ docs: SearchDoc[] }`、default export React component）

**デザイン:** デザインシステムに沿った検索面。上部に検索入力（プレースホルダ「手法名・キーワードで探す（例：相関）」）、難易度ピル（`基礎〜高度`、トグルで複数選択）、件数表示、結果リスト（各行: 手法名・読み・一言・難易度バッジ・`/methods/<id>` リンク）。`@theme` トークン使用。難易度バッジは `difficultyBadgeClass`。

- [ ] **Step 1: 最小レンダリングテスト（失敗）**
```tsx
// tests/search-app.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchApp from '../src/components/SearchApp';
import { buildSearchIndex } from '../src/lib/search';
import { sampleMethod } from './fixtures/sample-method';

const docs = buildSearchIndex([
  { id: 'mean', data: sampleMethod },
  { id: 'median', data: { ...sampleMethod, name: '中央値', reading: 'ちゅうおうち', english: 'Median', oneLiner: '真ん中の値', keywords: ['median'], difficulty: '初級' } as any },
]);

describe('SearchApp', () => {
  it('初期表示で全件、入力で絞り込む', () => {
    render(<SearchApp docs={docs} />);
    expect(screen.getByText('平均')).toBeTruthy();
    expect(screen.getByText('中央値')).toBeTruthy();
    const input = screen.getByPlaceholderText(/手法名・キーワード/);
    fireEvent.change(input, { target: { value: 'へいきん' } });
    expect(screen.getByText('平均')).toBeTruthy();
    expect(screen.queryByText('中央値')).toBeNull();
  });
});
```

- [ ] **Step 2: 実行して失敗を確認** → FAIL。

- [ ] **Step 3: 実装する**
`useState` で `query`・`difficulties`（`string[]`）を保持し、`searchMethods(docs, { query, difficulties })` で結果を算出。難易度ピルは `DIFFICULTIES` を回し、トグルで `difficulties` を更新。結果は手法名・読み・一言・難易度バッジ・詳細リンクを描画。デザインシステムのトークンで装飾。**ロジックは search.ts に委譲**（コンポーネント内に検索ロジックを再実装しない）。

- [ ] **Step 4: 実行して成功を確認** → PASS。`npx astro check` 0エラー。

- [ ] **Step 5: コミット**
```bash
git add src/components/SearchApp.tsx tests/search-app.test.tsx
git commit -m "feat: add SearchApp React island (query + difficulty filter)"
```

---

## Task 4: /search ページと導線の接続

**Files:** Create `src/pages/search.astro`; Modify `src/components/SiteHeader.astro`, `src/pages/index.astro`

**Interfaces:** Consumes `buildSearchIndex`, `allMethods()`, `SearchApp`.

- [ ] **Step 1: /search ページを実装**
```astro
---
// src/pages/search.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import SearchApp from '../components/SearchApp';
import { allMethods } from '../lib/methods';
import { buildSearchIndex } from '../lib/search';
const docs = buildSearchIndex(await allMethods());
---
<BaseLayout title="検索・絞り込み | 分析手法アトラス" active="難易度">
  <h1 class="font-display text-2xl font-bold mt-4">手法を検索・絞り込み</h1>
  <p class="text-ink-soft mt-2 mb-6">手法名・キーワードで探す、または難易度で絞り込みます。</p>
  <SearchApp client:load docs={docs} />
</BaseLayout>
```

- [ ] **Step 2: 導線を接続**
- `SiteHeader.astro`: 検索ボタンを `<a href="/search">` に（`type="button"` をやめる）。`難易度`ナビ項目の href を `/search` に。`active` 一致ラベルは「難易度」。
- `index.astro`: 難易度サブ入口カードの `href` を `/search` に（`#diff` をやめる）。TODOコメント整理。

- [ ] **Step 3: ビルドで検証**
Run: `npm run build` → `dist/search/index.html` が生成され、SearchApp の hydration スクリプトが含まれること（island が `client:load`）。`grep` で `/search` がヘッダーと難易度サブ入口に出ること。`npx astro check` 0エラー。`npm test` 全green。

- [ ] **Step 4: コミット**
```bash
git add src/pages/search.astro src/components/SiteHeader.astro src/pages/index.astro
git commit -m "feat: add /search page and wire search/difficulty entry points"
```

---

## Self-Review（カバレッジ）
- spec §6（検索・難易度フィルタ）→ Task 2/3/4。
- spec §3.1（検索ビュー）→ /search。
- 初の React island を `SearchApp` 1箇所に限定（§方針）。
- 検索ロジックは純関数でテスト（Task 2）、UI は最小テスト（Task 3）。
- 統制語彙（難易度）順守。
- プレースホルダ無し。型整合（`SearchDoc`/`searchMethods` を island とページで一貫使用）。

## 次の Plan
Plan 4 比較ビュー／Plan 5 サンプル分布チャート／Plan 6 関係マップ／Plan 7 共通注意＋仕上げ／コンテンツ制作。
