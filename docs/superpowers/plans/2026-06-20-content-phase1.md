# コンテンツ制作 フェーズ1 マスターリスト（手法24件の拡充）

現状2件（`mean`/`median`）。下記24件を追加し、計26件にする。各手法は既存スキーマ（`src/content/schema.ts`）に適合する YAML を `src/content/methods/<slug>.yaml` として作成。`mean.yaml`/`median.yaml` を**品質テンプレート**とする。

## 厳守ルール（参照整合・統制語彙）
- `related[].id` は **このマスターリストの slug のみ** を参照する（存在しない slug を書かない）。`tests/content.test.ts` が参照整合を検証する。
- `difficulty` ∈ `基礎/初級/中級/上級/高度`。`related[].type` ∈ `類似/比較対象/前提/発展/併用/前処理/後処理/代替/補完`。
- `purposeCategories` は15目的、`dataCategories` は11データ種類、`mathCategories` は15数学カテゴリの**正式ラベル**から選ぶ（`taxonomy.ts`/`schema.ts` と完全一致）。
- 必須フィールドを全て埋める：name, reading, english, summary, oneLiner, analogy, whatYouLearn, suitableData[], suitablePurposes[], inputData, sampleTable{caption?,columns[],rows[][]}, results, howToRead, beforeAfter{before,after}, whenToUse[], whenNotToUse[], cautions[], related[], aiPromptExample, difficulty, tags[], keywords[], purposeCategories[], dataCategories[], mathCategories[]。任意：sampleChart, formula。
- `sampleChart` は「サンプルで見ると腹落ちする」手法に付ける（型: scatter/bar/line/histogram。box/heatmap は未対応）。points は `number[][]`。
- 非専門家向けに**平易**に。数式は補助（formula 任意）。たとえ話は必須。

## マスターリスト（slug / 名称 / 難易度 / 主な目的 / データ種類 / 数学カテゴリ / chart）

### 既存（テンプレート）
- `mean` 平均 / 基礎 / 傾向を知りたい,要約したい / 数値データ / 基礎統計 / bar
- `median` 中央値 / 基礎 / 傾向を知りたい,要約したい / 数値データ / 基礎統計 / –

### バッチA — 基礎統計・ばらつき（6）
- `mode` 最頻値 / 基礎 / 傾向を知りたい,要約したい / 数値データ,カテゴリデータ / 基礎統計 / bar
- `variance` 分散 / 初級 / ばらつきを知りたい / 数値データ / 基礎統計 / –
- `std-dev` 標準偏差 / 初級 / ばらつきを知りたい / 数値データ / 基礎統計 / histogram
- `quartile` 四分位数 / 初級 / ばらつきを知りたい / 数値データ / 基礎統計 / –
- `deviation-value` 偏差値 / 初級 / ランキングしたい / 数値データ / 基礎統計,ソート・ランキング / –
- `covariance` 共分散 / 中級 / 関係性を知りたい / 数値データ / 基礎統計 / –

### バッチB — 可視化・関係性（6）
- `histogram` ヒストグラム / 基礎 / 傾向を知りたい,ばらつきを知りたい / 数値データ / 基礎統計 / histogram
- `boxplot` 箱ひげ図 / 初級 / ばらつきを知りたい / 数値データ / 基礎統計 / –
- `scatter-plot` 散布図 / 基礎 / 関係性を知りたい / 数値データ / 基礎統計 / scatter
- `correlation` 相関係数 / 初級 / 関係性を知りたい,影響要因を知りたい / 数値データ / 基礎統計 / scatter
- `t-test` t検定 / 中級 / 関係性を知りたい / 数値データ / 統計的検定 / –
- `chi-squared` カイ二乗検定 / 中級 / 関係性を知りたい / カテゴリデータ / 統計的検定 / –

### バッチC — 回帰・分類（6）
- `simple-regression` 単回帰分析 / 中級 / 関係性を知りたい,予測したい / 数値データ / 回帰分析 / scatter
- `multiple-regression` 重回帰分析 / 中級 / 影響要因を知りたい,予測したい / 数値データ,多次元データ / 回帰分析 / –
- `logistic-regression` ロジスティック回帰 / 中級 / 分類したい / 数値データ / 回帰分析,分類 / –
- `decision-tree` 決定木 / 中級 / 分類したい,影響要因を知りたい / 数値データ,カテゴリデータ / 分類 / –
- `random-forest` ランダムフォレスト / 上級 / 分類したい,予測したい,影響要因を知りたい / 数値データ,多次元データ / 分類 / –
- `knn` k近傍法 / 初級 / 分類したい,似ているものを探したい / 数値データ / 分類,ベクトル・距離・類似度 / –

### バッチD — クラスタリング・時系列・異常・次元・類似（6）
- `kmeans` k-means / 中級 / グループ分けしたい / 数値データ,多次元データ / クラスタリング / scatter
- `hierarchical-clustering` 階層クラスタリング / 中級 / グループ分けしたい,構造を見つけたい / 数値データ,多次元データ / クラスタリング / –
- `moving-average` 移動平均 / 初級 / 変化を見つけたい,傾向を知りたい,予測したい / 時系列データ / 時系列解析 / line
- `zscore` z-score / 初級 / 異常を見つけたい / 数値データ / 異常検知,基礎統計 / –
- `pca` 主成分分析（PCA） / 中級 / 次元を減らしたい,グループ分けしたい,要約したい / 多次元データ / 次元削減 / scatter
- `cosine-similarity` コサイン類似度 / 初級 / 似ているものを探したい / 数値データ,テキストデータ,多次元データ / ベクトル・距離・類似度 / –

## 自然な関連（related の参考。最終的には各手法から複数張る）
- 代表値: mean↔median↔mode（比較対象）、mean–std-dev（併用）
- ばらつき: variance↔std-dev（前提/発展）、quartile↔boxplot（併用）、std-dev–histogram（併用）
- 関係性: correlation↔covariance（比較対象）、correlation→simple-regression（発展）、correlation–scatter-plot（併用）、t-test↔chi-squared（比較対象）
- 回帰/分類: simple→multiple-regression（発展）、logistic-regression↔decision-tree（比較対象）、decision-tree→random-forest（発展）、knn↔kmeans（比較対象）
- クラスタリング/次元: kmeans↔hierarchical-clustering（比較対象）、pca→kmeans（前処理）、cosine-similarity↔knn（併用）
- 前処理: std-dev/standardization 系は今回 standardization は未収録のため zscore↔std-dev（前提）
- 異常: zscore↔std-dev（前提）

## 検証（各バッチ後）
- `npm test`（`tests/content.test.ts` がスキーマ＋参照整合を検証）→ green
- `npx astro check` → 0エラー
- `npm run build` → 成功（手法ページ・ハブ・比較・アトラスが新コンテンツで充実）
