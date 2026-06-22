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

// ---------------------------------------------------------------------------
// サンプル図（sampleChart）の定義
// ---------------------------------------------------------------------------
// 図の色は @theme トークン名で指定し、描画側で var(--color-<name>) に変換する。
// 生の 16 進カラーをコンテンツ側でもコンポーネント側でも使わない規律のため、
// 色は固定の列挙にしている。
export const CHART_COLORS = [
  'signal', 'signal-deep', 'water', 'good', 'gold',
  'ink', 'ink-soft', 'ink-faint', 'line', 'line-strong',
] as const;
export type ChartColor = (typeof CHART_COLORS)[number];
const chartColor = z.enum(CHART_COLORS);

// 軸ラベル＋単位（例: { label: '勉強時間', unit: '時間' }）。
const axisSpec = z.object({
  label: z.string(),
  unit: z.string().optional(),
});

// 基準線（平均線・しきい値など）。
const refLine = z.object({
  axis: z.enum(['x', 'y']),
  value: z.number(),
  label: z.string().optional(),
  color: chartColor.default('gold'),
  dashed: z.boolean().default(true),
});

// 基準帯（±1SD・IQR など）。
const refArea = z.object({
  axis: z.enum(['x', 'y']),
  from: z.number(),
  to: z.number(),
  label: z.string().optional(),
  color: chartColor.default('water'),
});

// 点への注記（「最頻値」「異常の疑い」など）。
const pointAnnotation = z.object({
  x: z.number(),
  y: z.number(),
  label: z.string(),
  color: chartColor.optional(),
  // ラベルの寄せ方向（既定: 点の上）。
  place: z.enum(['top', 'bottom', 'left', 'right']).default('top'),
});

const series = z.object({
  label: z.string().optional(),
  color: chartColor.optional(),
  points: z.array(z.tuple([z.number(), z.number()])).min(1),
});

// データチャート共通のメタ。
const chartBase = {
  caption: z.string().optional(),
  x: axisSpec.optional(),
  y: axisSpec.optional(),
  referenceLines: z.array(refLine).default([]),
  referenceAreas: z.array(refArea).default([]),
  annotations: z.array(pointAnnotation).default([]),
};

// ---- データチャート ----
const barChart = z.object({
  type: z.literal('bar'),
  // 多系列を横並びの群棒にするか（false なら積み上げず単純な棒）。
  grouped: z.boolean().default(false),
  // 順序カテゴリの x ラベル（例: ['S','M','L']）。指定時は points の x をインデックス扱い。
  categories: z.array(z.string()).optional(),
  series: z.array(series).min(1),
  ...chartBase,
});

const lineChart = z.object({
  type: z.literal('line'),
  series: z.array(series).min(1),
  ...chartBase,
});

const scatterChart = z.object({
  type: z.literal('scatter'),
  // 最小二乗の回帰直線（＋R²）を重ねる。
  fit: z.boolean().default(false),
  fitLabel: z.string().optional(),
  series: z.array(series).min(1),
  ...chartBase,
});

const histogramChart = z.object({
  type: z.literal('histogram'),
  // points = [階級の代表値, 度数]
  series: z.array(series).min(1),
  ...chartBase,
});

const boxSummary = z.object({
  label: z.string(),
  min: z.number(),
  q1: z.number(),
  median: z.number(),
  q3: z.number(),
  max: z.number(),
  color: chartColor.optional(),
});
const boxplotChart = z.object({
  type: z.literal('boxplot'),
  boxes: z.array(boxSummary).min(1),
  ...chartBase,
});

const logisticChart = z.object({
  type: z.literal('logistic'),
  // 実測の 0/1 アウトカム
  points: z.array(z.tuple([z.number(), z.number()])).min(1),
  // フィット済みロジスティック曲線 1/(1+e^-(b0+b1 x))
  curve: z.object({ b0: z.number(), b1: z.number() }),
  threshold: z.number().default(0.5),
  ...chartBase,
});

// ---- 模式図（schematic diagrams） ----
type TreeNodeInput = {
  label?: string;
  condition?: string;
  leaf?: string;
  leafColor?: ChartColor;
  children?: TreeNodeInput[];
};
const treeNode: z.ZodType<TreeNodeInput> = z.lazy(() =>
  z.object({
    // 判定ノードは label（質問）、葉は leaf を使う。どちらか一方でよい。
    label: z.string().optional(),
    condition: z.string().optional(),
    leaf: z.string().optional(),
    leafColor: chartColor.optional(),
    children: z.array(treeNode).optional(),
  }),
);
const treeDiagram = z.object({
  type: z.literal('tree'),
  root: treeNode,
  // >1 のとき N 本の小さな木を並べる（ランダムフォレスト）。
  ensemble: z.number().int().min(1).optional(),
  // 多数決などの結果ラベル（アンサンブル用）。
  result: z.string().optional(),
  caption: z.string().optional(),
});

const dendrogramDiagram = z.object({
  type: z.literal('dendrogram'),
  leaves: z.array(z.string()).min(2),
  // 併合の順序。a,b は葉ラベル or 既出マージの 0 始まりインデックス。
  merges: z.array(z.object({
    a: z.union([z.string(), z.number()]),
    b: z.union([z.string(), z.number()]),
    height: z.number(),
  })).min(1),
  cut: z.number().optional(),
  cutLabel: z.string().optional(),
  y: axisSpec.optional(),
  caption: z.string().optional(),
});

const vectorsDiagram = z.object({
  type: z.literal('vectors'),
  vectors: z.array(z.object({
    label: z.string(),
    x: z.number(),
    y: z.number(),
    color: chartColor.optional(),
  })).min(2),
  showAngle: z.boolean().default(true),
  x: axisSpec.optional(),
  y: axisSpec.optional(),
  caption: z.string().optional(),
});

const neighborhoodDiagram = z.object({
  type: z.literal('neighborhood'),
  points: z.array(z.object({
    x: z.number(),
    y: z.number(),
    cls: z.string(),
    color: chartColor.optional(),
  })).min(1),
  query: z.object({ x: z.number(), y: z.number() }),
  k: z.number().int().min(1),
  x: axisSpec.optional(),
  y: axisSpec.optional(),
  caption: z.string().optional(),
});

const clustersDiagram = z.object({
  type: z.literal('clusters'),
  clusters: z.array(z.object({
    label: z.string(),
    color: chartColor.optional(),
    points: z.array(z.tuple([z.number(), z.number()])).min(1),
    centroid: z.tuple([z.number(), z.number()]),
  })).min(1),
  x: axisSpec.optional(),
  y: axisSpec.optional(),
  caption: z.string().optional(),
});

const sampleChartSchema = z.discriminatedUnion('type', [
  barChart,
  lineChart,
  scatterChart,
  histogramChart,
  boxplotChart,
  logisticChart,
  treeDiagram,
  dendrogramDiagram,
  vectorsDiagram,
  neighborhoodDiagram,
  clustersDiagram,
]);

export type SampleChartConfig = z.infer<typeof sampleChartSchema>;
// 模式図（静的SVG）として描く type の集合。これ以外は Recharts アイランドで描く。
export const DIAGRAM_TYPES = [
  'tree', 'dendrogram', 'vectors', 'neighborhood', 'clusters',
] as const;

// ---------------------------------------------------------------------------
// 計算の手順（derivation）— 数式（LaTeX）＋数学が苦手な人向けの説明
// ---------------------------------------------------------------------------
// formula/example/sym は KaTeX で描画する LaTeX 文字列。
// explain/meaning/result は日本語の平易な説明文。
const derivationStep = z.object({
  formula: z.string(),             // 一般式（LaTeX, display）
  explain: z.string(),             // この式が何をしているかの平易な説明
  example: z.string().optional(),  // ページの例の数値を代入した式（LaTeX）
  result: z.string().optional(),   // 代入結果の一言（日本語）
});
const symbolDef = z.object({
  sym: z.string(),                 // 記号（LaTeX, inline）
  meaning: z.string(),             // 記号の意味（日本語）
});
const derivationSchema = z.object({
  intro: z.string().optional(),    // 全体の導入（任意・1〜2文）
  symbols: z.array(symbolDef).default([]),  // 記号の意味
  steps: z.array(derivationStep).min(1),    // 手順（最低1つ）
});
export type Derivation = z.infer<typeof derivationSchema>;

// ---------------------------------------------------------------------------
// 答え（keyResults）— このページの例データで「実際に求まった値」
// ---------------------------------------------------------------------------
// データ表の直下に大きく出す。value は "80" / "M" / "+0.99" / "15〜30" など柔軟に文字列。
const keyResult = z.object({
  label: z.string(),               // 例: 平均
  value: z.string(),               // 例: 80
  unit: z.string().optional(),     // 例: 点
  hint: z.string().optional(),     // 例: 合計400 ÷ 5人
});
export type KeyResult = z.infer<typeof keyResult>;

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
  // 例データで実際に求まった「答え」。データ表の直下に大きく表示する。全手法に付ける。
  keyResults: z.array(keyResult).min(1),
  // すべての手法ページに「意味のある図」を必ず付ける方針のため必須にする。
  sampleChart: sampleChartSchema,
  // 結果
  results: z.string(),
  howToRead: z.string(),
  beforeAfter: z.object({ before: z.string(), after: z.string() }),
  // 使い分け・注意
  whenToUse: z.array(z.string()).min(1),
  whenNotToUse: z.array(z.string()).min(1),
  cautions: z.array(z.string()).min(1),
  // 計算の手順（数式＋平易な説明）。全手法に付ける方針のため必須。
  derivation: derivationSchema,
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
