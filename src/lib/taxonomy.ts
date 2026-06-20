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

const bySlug = (arr: TaxoEntry[]) => (slug: string): TaxoEntry | undefined => arr.find((e) => e.slug === slug);
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
