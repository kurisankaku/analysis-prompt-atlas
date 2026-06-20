# コンテンツ制作 フェーズ2 マスターリスト（新規手法 74〜83件の拡充）

フェーズ1の26件を土台に、要件定義書 §10/§11/§12/§18/§19 の代表手法・優先手法のうち**未収録のもの**を74件以上（本リストは最大83件を列挙）追加し、合計**100件以上**にする。各手法は既存スキーマ（`src/content/schema.ts`）に適合する YAML を `src/content/methods/<slug>.yaml` として作成する（本ドキュメントは**マスターリストのみ**で、YAML 本体の作成は別途バッチで行う）。`mean.yaml`/`median.yaml` を**品質テンプレート**とする。

## 収録方針
- フェーズ1の **26件 → 100件以上** に拡充し、要件 §18/§19 の「100件以上」目標を満たす（本リスト83件すべて収録で計109件）。
- 15目的 / 11データ種類 / 15数学カテゴリの**すべてのカテゴリにハブが populate される**ように、空または手薄なカテゴリ（確率・分布／前処理／時系列深掘り／異常検知深掘り／ベクトル・距離・類似度／行列・分解／微分・積分・最適化／テキスト分析／ネットワーク分析／ソート・ランキング、および 売上・購買／アンケート／ログ／位置情報／画像データ）を最優先で埋める。
- 制作は**テーマ別バッチ（約6〜8件）**で進め、各バッチ後に `tests/content.test.ts` がスキーマ適合と参照整合（`related[].id`）を検証する。
- 非専門家向けに**平易**に。たとえ話は必須、数式は補助（`formula` 任意）。

## 厳守ルール（参照整合・統制語彙・必須フィールド）
- `related[].id` は **フェーズ1の26 slug ∪ 本フェーズ2の新規 slug** のみを参照する（存在しない slug を書かない）。`tests/content.test.ts` が参照整合を検証する。
- slug は ASCII `[a-z0-9-]+`、**全件ユニーク**、かつ**フェーズ1の26 slugと衝突しない**こと。
- `difficulty` ∈ `基礎/初級/中級/上級/高度`。`related[].type` ∈ `類似/比較対象/前提/発展/併用/前処理/後処理/代替/補完`。
- `purposeCategories`（15目的）/ `dataCategories`（11データ種類）/ `mathCategories`（15数学カテゴリ）は**正式ラベルから選ぶ**（`taxonomy.ts`/`schema.ts` と完全一致）。
- 必須フィールドを全て埋める：name, reading, english, summary, oneLiner, analogy, whatYouLearn, suitableData[], suitablePurposes[], inputData, sampleTable{caption?,columns[],rows[][]}, results, howToRead, beforeAfter{before,after}, whenToUse[], whenNotToUse[], cautions[], related[], aiPromptExample, difficulty, tags[], keywords[], purposeCategories[], dataCategories[], mathCategories[]。任意：sampleChart, formula。
- `sampleChart` は「サンプルで見ると腹落ちする」手法にのみ付ける。**対応する型は scatter/bar/line/histogram の4種のみ**（box/heatmap は未対応 → 列は `–`）。points は `number[][]`。

## フェーズ1で収録済み（再追加しない26 slug）
mean, median, mode, variance, std-dev, quartile, deviation-value, covariance, histogram, boxplot, scatter-plot, correlation, t-test, chi-squared, simple-regression, multiple-regression, logistic-regression, decision-tree, random-forest, knn, kmeans, hierarchical-clustering, moving-average, zscore, pca, cosine-similarity

---

## マスターリスト（slug / 名称 / 難易度 / 主な目的 / データ種類 / 数学カテゴリ / chart）

### バッチE — 基礎統計の残り・ばらつきの深掘り（7）
- `range` 範囲（レンジ） / 基礎 / ばらつきを知りたい / 数値データ / 基礎統計 / –
- `iqr` 四分位範囲（IQR） / 初級 / ばらつきを知りたい / 数値データ / 基礎統計 / –  （ばらつきの尺度。1.5×IQRの外れ値ルールは `iqr-outlier` に分離）
- `percentile` パーセンタイル / 初級 / 傾向を知りたい,ランキングしたい / 数値データ / 基礎統計,ソート・ランキング / –
- `coefficient-of-variation` 変動係数 / 中級 / ばらつきを知りたい,要約したい / 数値データ / 基礎統計 / –
- `skewness` 歪度 / 中級 / ばらつきを知りたい,傾向を知りたい / 数値データ / 基礎統計,確率・分布 / histogram
- `kurtosis` 尖度 / 中級 / ばらつきを知りたい / 数値データ / 基礎統計,確率・分布 / histogram
- `cross-tabulation` クロス集計 / 基礎 / 関係性を知りたい,要約したい / カテゴリデータ,アンケートデータ / 基礎統計 / bar

### バッチF — 確率・分布の概念（7）
- `probability-basics` 確率の基礎 / 基礎 / 傾向を知りたい / 数値データ,カテゴリデータ / 確率・分布 / –
- `conditional-probability` 条件付き確率 / 中級 / 関係性を知りたい / カテゴリデータ / 確率・分布 / –
- `bayes-theorem` ベイズの定理 / 中級 / 分類したい,関係性を知りたい / カテゴリデータ / 確率・分布 / –
- `expected-value` 期待値 / 初級 / 傾向を知りたい,要約したい / 数値データ / 確率・分布,基礎統計 / –
- `normal-distribution` 正規分布 / 初級 / 傾向を知りたい,ばらつきを知りたい / 数値データ / 確率・分布 / histogram
- `binomial-poisson` 二項分布・ポアソン分布 / 中級 / 傾向を知りたい,予測したい / 数値データ,カテゴリデータ / 確率・分布 / bar
- `naive-bayes` ナイーブベイズ / 中級 / 分類したい / テキストデータ,カテゴリデータ / 確率・分布,分類 / –

### バッチG — 統計的検定の深掘り（7）
- `hypothesis-testing` 仮説検定（p値・有意水準） / 中級 / 関係性を知りたい / 数値データ / 統計的検定 / –
- `confidence-interval` 信頼区間 / 中級 / ばらつきを知りたい,傾向を知りたい / 数値データ / 統計的検定,確率・分布 / –
- `anova` 分散分析（ANOVA） / 中級 / 関係性を知りたい,影響要因を知りたい / 数値データ,カテゴリデータ / 統計的検定 / bar
- `paired-t-test` 対応のあるt検定 / 中級 / 変化を見つけたい,関係性を知りたい / 数値データ / 統計的検定 / –
- `mann-whitney` Mann-Whitney U検定 / 上級 / 関係性を知りたい / 数値データ / 統計的検定 / –
- `ab-test` A/Bテスト / 中級 / 関係性を知りたい,影響要因を知りたい / 数値データ,ログデータ / 統計的検定 / bar
- `effect-size` 効果量 / 上級 / 関係性を知りたい / 数値データ / 統計的検定 / –

### バッチH — データ前処理（7）
- `missing-value-handling` 欠損値処理 / 初級 / 要約したい / 数値データ,多次元データ / 基礎統計 / –
- `outlier-handling` 外れ値処理 / 初級 / 異常を見つけたい / 数値データ / 異常検知,基礎統計 / –
- `standardization` 標準化 / 初級 / 要約したい / 数値データ,多次元データ / 基礎統計,ベクトル・距離・類似度 / –
- `normalization` 正規化（Min-Max） / 初級 / 要約したい / 数値データ,多次元データ / 基礎統計 / –
- `log-transform` 対数変換 / 中級 / 傾向を知りたい,ばらつきを知りたい / 数値データ / 基礎統計,確率・分布 / histogram
- `one-hot-encoding` One-Hot Encoding / 初級 / 要約したい / カテゴリデータ,多次元データ / 基礎統計 / –
- `feature-selection` 特徴量選択 / 中級 / 次元を減らしたい,影響要因を知りたい / 多次元データ / 次元削減 / –

### バッチI — 回帰・予測の発展（6）
- `polynomial-regression` 多項式回帰 / 中級 / 予測したい,関係性を知りたい / 数値データ / 回帰分析 / scatter
- `ridge-regression` リッジ回帰 / 上級 / 予測したい,影響要因を知りたい / 数値データ,多次元データ / 回帰分析 / –
- `lasso-regression` Lasso回帰 / 上級 / 予測したい,次元を減らしたい,影響要因を知りたい / 数値データ,多次元データ / 回帰分析,次元削減 / –
- `gradient-boosting` 勾配ブースティング / 上級 / 予測したい,分類したい,影響要因を知りたい / 数値データ,多次元データ / 分類,回帰分析 / –
- `feature-importance` 特徴量重要度 / 中級 / 影響要因を知りたい / 多次元データ,数値データ / 分類 / bar
- `confusion-matrix` 混同行列・評価指標 / 中級 / 分類したい / カテゴリデータ / 分類 / –

### バッチJ — 分類・SVM・評価（6）
- `svm` サポートベクターマシン（SVM） / 上級 / 分類したい / 数値データ,多次元データ / 分類,ベクトル・距離・類似度 / scatter
- `roc-auc` ROC曲線・AUC / 中級 / 分類したい / カテゴリデータ / 分類 / line
- `dbscan` DBSCAN / 上級 / グループ分けしたい,異常を見つけたい / 数値データ,位置情報データ / クラスタリング / scatter
- `gmm` 混合ガウスモデル（GMM） / 上級 / グループ分けしたい,構造を見つけたい / 数値データ,多次元データ / クラスタリング,確率・分布 / scatter
- `factor-analysis` 因子分析 / 上級 / 構造を見つけたい,次元を減らしたい / アンケートデータ,多次元データ / 次元削減 / –
- `correspondence-analysis` 対応分析 / 上級 / 関係性を知りたい,構造を見つけたい / カテゴリデータ,アンケートデータ / 次元削減 / scatter

### バッチK — 時系列解析の深掘り（7）
- `differencing` 差分・変化率 / 初級 / 変化を見つけたい / 時系列データ / 時系列解析 / line
- `cumulative-sum` 累積和 / 基礎 / 変化を見つけたい,傾向を知りたい / 時系列データ / 時系列解析 / line
- `exponential-smoothing` 指数平滑法 / 中級 / 予測したい,傾向を知りたい / 時系列データ / 時系列解析 / line
- `autocorrelation` 自己相関・偏自己相関 / 上級 / 関係性を知りたい,変化を見つけたい / 時系列データ / 時系列解析 / line
- `seasonal-decomposition` 季節性分解 / 中級 / 変化を見つけたい,傾向を知りたい / 時系列データ / 時系列解析 / line
- `arima` ARIMA / 上級 / 予測したい / 時系列データ / 時系列解析 / line
- `change-point-detection` 変化点検出 / 上級 / 変化を見つけたい,異常を見つけたい / 時系列データ,ログデータ / 時系列解析,異常検知 / line

### バッチL — 異常検知・距離・類似度（7）
- `iqr-outlier` IQR法（外れ値検出） / 初級 / 異常を見つけたい / 数値データ / 異常検知,基礎統計 / –
- `three-sigma` 3σ法・管理図 / 中級 / 異常を見つけたい,変化を見つけたい / 数値データ,時系列データ / 異常検知 / line
- `isolation-forest` Isolation Forest / 上級 / 異常を見つけたい / 多次元データ,数値データ / 異常検知 / –
- `mahalanobis-distance` マハラノビス距離 / 上級 / 異常を見つけたい,似ているものを探したい / 多次元データ / ベクトル・距離・類似度,異常検知 / –
- `euclidean-distance` ユークリッド距離 / 基礎 / 似ているものを探したい / 数値データ,位置情報データ / ベクトル・距離・類似度 / scatter
- `manhattan-distance` マンハッタン距離 / 初級 / 似ているものを探したい / 数値データ,位置情報データ / ベクトル・距離・類似度 / –
- `jaccard-index` Jaccard係数 / 初級 / 似ているものを探したい / カテゴリデータ,テキストデータ / ベクトル・距離・類似度 / –

### バッチM — ベクトル・行列・分解・最適化（7）
- `dot-product-norm` 内積・ノルム / 中級 / 似ているものを探したい / 数値データ,多次元データ / ベクトル・距離・類似度,行列 / –
- `vector-embedding` ベクトル埋め込み（近傍探索） / 中級 / 似ているものを探したい,次元を減らしたい / テキストデータ,多次元データ / ベクトル・距離・類似度,行列 / –
- `svd` 特異値分解（SVD） / 上級 / 次元を減らしたい,要約したい / 多次元データ / 行列,次元削減 / –
- `collaborative-filtering` 協調フィルタリング / 上級 / 似ているものを探したい,予測したい / 売上・購買データ,多次元データ / 行列,ベクトル・距離・類似度 / –
- `gradient-descent` 勾配降下法 / 上級 / 最適化したい / 数値データ / 微分・積分・最適化 / line
- `least-squares` 最小二乗法 / 中級 / 関係性を知りたい,予測したい / 数値データ / 微分・積分・最適化,回帰分析 / scatter
- `linear-programming` 線形計画法 / 上級 / 最適化したい / 数値データ / 微分・積分・最適化 / –

### バッチN — 最適化の発展・テキスト分析（7）
- `bayesian-optimization` ベイズ最適化 / 高度 / 最適化したい / 数値データ,多次元データ / 微分・積分・最適化,確率・分布 / –
- `bag-of-words` Bag of Words / 初級 / 要約したい / テキストデータ / テキスト分析,行列 / –
- `tf-idf` TF-IDF / 中級 / 要約したい,似ているものを探したい / テキストデータ / テキスト分析,ベクトル・距離・類似度 / bar
- `word2vec` Word2Vec（単語埋め込み） / 上級 / 似ているものを探したい,次元を減らしたい / テキストデータ / テキスト分析,ベクトル・距離・類似度 / –
- `topic-model-lda` トピックモデル（LDA） / 上級 / 構造を見つけたい,要約したい / テキストデータ,アンケートデータ / テキスト分析,次元削減 / –
- `sentiment-analysis` 感情分析 / 中級 / 分類したい,要約したい / テキストデータ,アンケートデータ / テキスト分析,分類 / bar
- `keyword-extraction` キーワード抽出 / 初級 / 要約したい / テキストデータ / テキスト分析 / bar

### バッチO — ネットワーク分析・ソート・ランキング（7）
- `graph-basics` グラフ理論の基礎（ノード・エッジ・次数） / 中級 / 構造を見つけたい / ネットワークデータ / ネットワーク分析 / –
- `centrality` 中心性（次数・近接・媒介） / 上級 / 構造を見つけたい,ランキングしたい / ネットワークデータ / ネットワーク分析 / bar
- `pagerank` PageRank / 上級 / ランキングしたい,構造を見つけたい / ネットワークデータ / ネットワーク分析,行列,ソート・ランキング / –
- `community-detection` コミュニティ検出（Louvain法） / 上級 / グループ分けしたい,構造を見つけたい / ネットワークデータ / ネットワーク分析,クラスタリング / –
- `co-occurrence-network` 共起ネットワーク / 中級 / 構造を見つけたい,関係性を知りたい / テキストデータ,ネットワークデータ / ネットワーク分析,テキスト分析 / –
- `sorting` ソート（昇順・降順・複数条件） / 基礎 / ランキングしたい / 数値データ,カテゴリデータ / ソート・ランキング / –
- `weighted-average` 加重平均・スコアリング / 初級 / ランキングしたい,要約したい / 数値データ,アンケートデータ / ソート・ランキング,基礎統計 / –

### バッチP — 多基準ランキング・業務データ向け代表手法（8）
- `topsis` TOPSIS / 上級 / ランキングしたい,最適化したい / 多次元データ / ソート・ランキング / –
- `ahp` AHP（階層分析法） / 上級 / ランキングしたい,最適化したい / アンケートデータ,多次元データ / ソート・ランキング,行列 / –
- `abc-analysis` ABC分析 / 初級 / ランキングしたい,要約したい / 売上・購買データ / ソート・ランキング,基礎統計 / bar
- `rfm-analysis` RFM分析 / 中級 / グループ分けしたい,ランキングしたい / 売上・購買データ / クラスタリング,ソート・ランキング / –
- `market-basket-analysis` バスケット分析（アソシエーション分析） / 中級 / 関係性を知りたい,構造を見つけたい / 売上・購買データ / 確率・分布 / –  （支持度・確信度・リフト＝条件付き確率がコア）
- `cohort-analysis` コホート分析 / 中級 / 変化を見つけたい,傾向を知りたい / 売上・購買データ,ログデータ / 時系列解析 / line
- `funnel-analysis` ファネル分析 / 初級 / 変化を見つけたい,傾向を知りたい / ログデータ / 基礎統計 / bar
- `geo-clustering` 地理的クラスタリング（重心・最近傍） / 中級 / グループ分けしたい,似ているものを探したい / 位置情報データ / クラスタリング,ベクトル・距離・類似度 / scatter

---

## 補足（採番・カテゴリ充足の確認）

新規手法は **バッチE〜P の合計 = 7+7+7+7+6+6+7+7+7+7+7+8 = 83件** を列挙した。**目標下限は新規74件（合計100件以上）**で、§18/§19 の「100件以上」を満たす。さらに絞る余地はあるが、74件を下回らないこと、かつ各数学カテゴリに最低1件残すこと。トリム候補は難易度「高度」の周辺手法（例：`bayesian-optimization`, `effect-size`, `correspondence-analysis`, `gradient-descent`, `dot-product-norm`）。

### 全カテゴリのハブ充足（フェーズ1＋フェーズ2）
- **目的（15）**: 全15目的に手法が割当済み。フェーズ1で薄かった「異常を見つけたい」「変化を見つけたい」「ランキングしたい」「最適化したい」「構造を見つけたい」「似ているものを探したい」をバッチK/L/M/N/O/Pで厚くした。
- **データ種類（11）**: フェーズ1で空だった **テキストデータ / ログデータ / 売上・購買データ / アンケートデータ / 位置情報データ / ネットワークデータ** を、それぞれ バッチF/N/O（テキスト・ネットワーク）、バッチP（売上・購買・ログ・位置情報）、バッチF/G/J/N/P（アンケート）で充足。**画像データのみ**は本フェーズでも代表手法を立てていない（後述の判断事項）。
- **数学カテゴリ（15）**: フェーズ1で空だった **確率・分布（バッチF）/ 行列（バッチH/M/O）/ 微分・積分・最適化（バッチM/N）/ ネットワーク分析（バッチO/P）/ テキスト分析（バッチN/O）** を新規充足。手薄だった 統計的検定（G）・時系列解析（K）・異常検知（L）・ベクトル距離（L/M）・ソート・ランキング（O/P）も深掘り。

## 自然な関連（related の参考。最終的には各手法から複数張る。★はフェーズ1↔2のブリッジ）

### 基礎統計・ばらつき
- `range`↔`iqr`（比較対象）、`iqr`↔`quartile`★（前提）、`iqr`↔`boxplot`★（併用）、`iqr`→`iqr-outlier`（発展）
- `percentile`↔`quartile`★（類似）、`percentile`↔`deviation-value`★（比較対象）
- `coefficient-of-variation`↔`std-dev`★（前提）、`coefficient-of-variation`↔`mean`★（前提）
- `skewness`/`kurtosis`↔`histogram`★（併用）、`skewness`↔`normal-distribution`（比較対象）、`skewness`→`log-transform`（後処理）
- `cross-tabulation`↔`chi-squared`★（後処理）、`cross-tabulation`↔`correspondence-analysis`（発展）

### 確率・分布
- `probability-basics`→`conditional-probability`→`bayes-theorem`（前提→発展）
- `bayes-theorem`→`naive-bayes`（発展）、`naive-bayes`↔`logistic-regression`★（比較対象）
- `expected-value`↔`mean`★（類似）、`normal-distribution`↔`std-dev`★（併用）、`normal-distribution`↔`zscore`★（前提）
- `normal-distribution`↔`three-sigma`（前提）、`binomial-poisson`↔`probability-basics`（前提）

### 統計的検定
- `hypothesis-testing`→`t-test`★/`chi-squared`★/`anova`（前提）、`hypothesis-testing`↔`confidence-interval`（併用）
- `anova`↔`t-test`★（発展）、`paired-t-test`↔`t-test`★（比較対象）、`mann-whitney`↔`t-test`★（代替）
- `ab-test`↔`t-test`★（併用）、`ab-test`↔`hypothesis-testing`（前提）、`effect-size`↔`hypothesis-testing`（補完）

### 前処理（フェーズ1へのブリッジ多数）
- `standardization`↔`zscore`★（類似）、`standardization`↔`std-dev`★（前提）、`standardization`→`pca`★/`kmeans`★/`knn`★/`svm`（前処理）
- `normalization`↔`standardization`（比較対象）、`log-transform`↔`skewness`（補完）
- `missing-value-handling`/`outlier-handling`→`multiple-regression`★（前処理）、`outlier-handling`↔`iqr`/`zscore`★（併用）
- `one-hot-encoding`→`logistic-regression`★/`multiple-regression`★（前処理）
- `feature-selection`↔`lasso-regression`（類似）、`feature-selection`↔`feature-importance`（併用）、`feature-selection`→`pca`★（比較対象）

### 回帰・分類の発展（フェーズ1へのブリッジ）
- `polynomial-regression`↔`simple-regression`★（発展）、`ridge-regression`/`lasso-regression`↔`multiple-regression`★（発展）
- `ridge-regression`↔`lasso-regression`（比較対象）、`lasso-regression`↔`feature-selection`（併用）
- `gradient-boosting`↔`random-forest`★（比較対象）、`gradient-boosting`↔`decision-tree`★（発展）
- `feature-importance`↔`random-forest`★（後処理）、`confusion-matrix`↔`logistic-regression`★（後処理）、`confusion-matrix`↔`roc-auc`（併用）
- `svm`↔`logistic-regression`★（比較対象）、`svm`↔`knn`★（比較対象）、`roc-auc`↔`confusion-matrix`（補完）

### クラスタリング・次元削減（ブリッジ）
- `dbscan`↔`kmeans`★（比較対象）、`dbscan`↔`hierarchical-clustering`★（比較対象）、`gmm`↔`kmeans`★（発展）
- `factor-analysis`↔`pca`★（比較対象）、`correspondence-analysis`↔`pca`★（類似）、`svd`↔`pca`★（前提）
- `feature-selection`/`lasso-regression`↔`pca`★（比較対象：次元削減の選択 vs 圧縮）

### 時系列（ARIMA等 ↔ moving-average のブリッジ）
- `differencing`↔`moving-average`★（併用）、`exponential-smoothing`↔`moving-average`★（比較対象）
- `autocorrelation`→`arima`（前提）、`seasonal-decomposition`↔`moving-average`★（併用）、`seasonal-decomposition`→`arima`（前処理）
- `arima`↔`moving-average`★（発展）、`arima`↔`exponential-smoothing`（比較対象）
- `change-point-detection`↔`moving-average`★（併用）、`change-point-detection`↔`cumulative-sum`（併用）、`cumulative-sum`↔`differencing`（比較対象）

### 異常検知（ブリッジ）
- `iqr-outlier`↔`zscore`★（比較対象）、`iqr-outlier`↔`iqr`（前提）、`three-sigma`↔`zscore`★（類似）、`three-sigma`↔`std-dev`★（前提）
- `isolation-forest`↔`zscore`★（代替）、`isolation-forest`↔`random-forest`★（類似）
- `mahalanobis-distance`↔`euclidean-distance`（発展）、`mahalanobis-distance`↔`zscore`★（多変量版）

### ベクトル・距離・類似度（cosine-similarity / knn とのブリッジ）
- `euclidean-distance`↔`cosine-similarity`★（比較対象）、`euclidean-distance`↔`knn`★（前提）、`manhattan-distance`↔`euclidean-distance`（比較対象）
- `jaccard-index`↔`cosine-similarity`★（比較対象）、`dot-product-norm`→`cosine-similarity`★（前提）
- `vector-embedding`↔`cosine-similarity`★（併用）、`vector-embedding`↔`knn`★（併用）、`vector-embedding`↔`word2vec`（類似）

### 行列・分解・最適化（ブリッジ）
- `svd`↔`pca`★（前提）、`collaborative-filtering`↔`svd`（前提）、`collaborative-filtering`↔`cosine-similarity`★（併用）
- `least-squares`↔`simple-regression`★（前提）、`least-squares`↔`gradient-descent`（比較対象）
- `gradient-descent`↔`logistic-regression`★（前提）、`gradient-descent`↔`gradient-boosting`（前提）
- `linear-programming`↔`bayesian-optimization`（比較対象）、`bayesian-optimization`↔`gradient-descent`（代替）

### テキスト分析（cosine-similarity / ネットワークとのブリッジ）
- `bag-of-words`→`tf-idf`（発展）、`tf-idf`↔`cosine-similarity`★（併用）、`tf-idf`→`topic-model-lda`（前処理）
- `word2vec`↔`vector-embedding`（類似）、`word2vec`↔`cosine-similarity`★（併用）
- `topic-model-lda`↔`pca`★（比較対象）、`sentiment-analysis`↔`naive-bayes`（併用）、`keyword-extraction`↔`tf-idf`（類似）
- `co-occurrence-network`↔`keyword-extraction`（後処理）、`co-occurrence-network`↔`graph-basics`（前提）

### ネットワーク・ランキング
- `graph-basics`→`centrality`→`pagerank`（前提→発展）、`centrality`↔`pagerank`（比較対象）
- `community-detection`↔`hierarchical-clustering`★（類似）、`community-detection`↔`kmeans`★（比較対象）、`community-detection`↔`graph-basics`（前提）
- `pagerank`↔`weighted-average`（比較対象）、`sorting`↔`weighted-average`（併用）、`weighted-average`↔`deviation-value`★（類似）
- `topsis`↔`ahp`（比較対象）、`topsis`↔`weighted-average`（発展）、`ahp`↔`weighted-average`（発展）

### 業務データ向け（フェーズ1のクラスタリング・時系列へのブリッジ）
- `abc-analysis`↔`weighted-average`（併用）、`abc-analysis`↔`percentile`（併用）
- `rfm-analysis`↔`kmeans`★（併用）、`rfm-analysis`↔`abc-analysis`（類似）
- `market-basket-analysis`↔`co-occurrence-network`（類似）、`market-basket-analysis`↔`conditional-probability`（前提）
- `cohort-analysis`↔`moving-average`★（併用）、`funnel-analysis`↔`cross-tabulation`（類似）、`funnel-analysis`↔`cohort-analysis`（併用）
- `geo-clustering`↔`kmeans`★（類似）、`geo-clustering`↔`euclidean-distance`（前提）、`geo-clustering`↔`dbscan`（併用）

## 検証（各バッチ後）
- `npm test`（`tests/content.test.ts` がスキーマ＋参照整合を検証）→ green
- `npx astro check` → 0エラー
- `npm run build` → 成功（手法ページ・各ハブ・比較・アトラスが新コンテンツで充実）

## 判断事項・留意点
- **画像データ**: 要件 §11.5 の代表手法（CNN・物体検出等）は深層学習寄りで、本カタログの「非専門家がAIに指示する選択肢」という趣旨と難易度バランスから本フェーズでは独立手法を立てていない。`feature-selection`/`pca`★/`vector-embedding` 等が画像にも適用可能な旨を本文中で触れる方針とし、必要なら次フェーズで `image-embedding`（類似画像検索）を1件追加検討。
- **chart列の表記揺れ**: バッチL `iqr-outlier` は本来 boxplot が最適だが**boxplot/heatmap は未対応**のため `sampleChart` は付けない（列は `–`）。同様に相関行列・ヒートマップ系（`correspondence-analysis` 等）は散布図で代用するか `–` とする。
- **15数学カテゴリに収まりにくい手法**: 「前処理」は独立カテゴリが無いため、`standardization`/`normalization`/`one-hot-encoding`/`log-transform` 等は `基礎統計`（または `ベクトル・距離・類似度`）に割り当てた（タグ `前処理向き` で別途識別可能）。`ab-test`/`funnel-analysis`/`cohort-analysis` も専用カテゴリが無いため、`統計的検定`/`基礎統計`/`時系列解析` の最も近いカテゴリに寄せた。`market-basket-analysis` は支持度・確信度・リフト（条件付き確率）が本質のため `確率・分布` に置いた（ネットワーク的な共起は `co-occurrence-network` が担う）。
- **件数**: バッチE〜Pで83件を列挙。最終目標は新規**74件以上（合計100件以上）**で要件§18/§19を満たす。優先度の低い「高度」手法を間引いて調整可能だが、74件を下回らず、各数学カテゴリに最低1件残ることを必ず確認する。
