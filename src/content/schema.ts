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
