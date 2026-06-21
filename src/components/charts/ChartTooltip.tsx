// src/components/charts/ChartTooltip.tsx
// Recharts の Tooltip content。既定の白箱/灰枠（生hex）を避け、@theme トークンの
// Tailwind クラスで装飾する。ホバー時に下のデータの実値＋単位を表示する。
import type { ReactElement } from 'react';

export type AxisSpec = { label: string; unit?: string };

const fmt = (v: number): string => {
  if (!Number.isFinite(v)) return '';
  const r = Math.round(v * 100) / 100;
  return r.toLocaleString('ja-JP');
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: Record<string, unknown>; name?: string; value?: unknown }>;
};

export function makeTooltip(
  xSpec?: AxisSpec,
  ySpec?: AxisSpec,
  opts: { boxplot?: boolean } = {},
) {
  return function ChartTooltip({ active, payload }: TooltipProps): ReactElement | null {
    if (!active || !payload || payload.length === 0) return null;
    const row = (payload[0]?.payload ?? {}) as Record<string, number | string>;

    if (opts.boxplot) {
      const num = (k: string) => fmt(Number(row[k]));
      return (
        <div className="rounded border border-line bg-card px-3 py-2 text-xs text-ink shadow-md">
          <div className="font-bold">{String(row.label ?? '')}</div>
          <div className="mt-1 font-mono text-ink-soft">
            最大 {num('max')} / Q3 {num('q3')} / 中央 {num('median')} / Q1 {num('q1')} / 最小 {num('min')}
          </div>
        </div>
      );
    }

    const xVal = row.x;
    const yVal = row.y;
    const name = typeof row.name === 'string' ? row.name : payload[0]?.name;
    return (
      <div className="rounded border border-line bg-card px-3 py-2 text-xs text-ink shadow-md">
        {name && <div className="mb-1 font-bold">{name}</div>}
        {xSpec && xVal !== undefined && (
          <div>
            {xSpec.label}：<span className="font-mono">{fmt(Number(xVal))}{xSpec.unit ?? ''}</span>
          </div>
        )}
        {ySpec && yVal !== undefined && (
          <div>
            {ySpec.label}：<span className="font-mono">{fmt(Number(yVal))}{ySpec.unit ?? ''}</span>
          </div>
        )}
      </div>
    );
  };
}
