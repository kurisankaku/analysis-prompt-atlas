// src/lib/chart-config.ts
// チャート描画で共有する純粋ヘルパー（色トークン変換・系列整形・寸法）。React/DOM 非依存。
import type { ChartColor, SampleChartConfig } from '../content/schema';

export type { SampleChartConfig, ChartColor };

// @theme トークン名 → CSS 変数。生の 16 進カラーは一切使わない規律のため必ずここを通す。
export function tokenToVar(color?: ChartColor, fallback: ChartColor = 'signal'): string {
  return `var(--color-${color ?? fallback})`;
}

// 系列の既定色サイクル（@theme トークン名）。
export const SERIES_TOKENS: ChartColor[] = ['signal', 'water', 'gold', 'good'];

export function seriesColor(i: number, override?: ChartColor): string {
  return tokenToVar(override ?? SERIES_TOKENS[i % SERIES_TOKENS.length]);
}

// points([x,y][]) → Recharts 行配列。
export function toRows(points: [number, number][]): { x: number; y: number }[] {
  return points.map(([x, y]) => ({ x, y }));
}

// 軸ラベル＋単位 → 表示文字列（例: 「勉強時間（時間）」）。
export function axisTitle(spec?: { label: string; unit?: string }): string | undefined {
  if (!spec) return undefined;
  return spec.unit ? `${spec.label}（${spec.unit}）` : spec.label;
}

// チャートの論理寸法（固定。SSR で静的SVGを出すため % を使わず、CSS で流体化する）。
export const CHART_W = 640;
export const CHART_H = 380;
export const CHART_MARGIN = { top: 24, right: 28, bottom: 48, left: 56 };
