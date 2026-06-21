// src/components/charts/SampleChart.tsx
// 各手法の「サンプルで見る」データ図を Recharts で描く唯一のアイランド。
// 対応: bar / line / scatter(+回帰直線) / histogram / boxplot / logistic。
// 色はすべて @theme トークン → var(--color-…)（生hex不使用）。数値目盛り・軸ラベル/単位・
// 凡例・基準線（平均線/±SD帯/しきい値/回帰直線）・ホバーのツールチップを備える。
import type { ReactElement } from 'react';
import {
  ComposedChart, Bar, Line, Scatter, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ReferenceArea, ReferenceDot, ResponsiveContainer,
} from 'recharts';
import type { SampleChartConfig } from '../../content/schema';
import {
  tokenToVar, seriesColor, toRows, axisTitle, CHART_H, CHART_MARGIN,
} from '../../lib/chart-config';
import { linearFit, niceTicks } from '../../lib/chart-stats';
import { makeTooltip, type AxisSpec } from './ChartTooltip';
import { BoxShape } from './parts/BoxPlot';

interface Props {
  config: SampleChartConfig;
  // テスト/SSR 用に固定寸法で描く場合に指定。未指定なら ResponsiveContainer で流体化。
  width?: number;
  height?: number;
}

// ---- 共有スタイル（すべてトークン色） ----
const axisLine = { stroke: 'var(--color-line-strong)' } as const;
const tickStyle = { fill: 'var(--color-ink-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' } as const;
const tickLine = { stroke: 'var(--color-line)' } as const;
const GRID = 'var(--color-line)';
const fmtTick = (v: number) => `${Math.round(v * 100) / 100}`;

// Recharts の label 型は厳格なため、表示用の設定オブジェクトは any で渡す（色は var() トークン）。
function xAxisLabel(spec?: AxisSpec): any {
  const t = axisTitle(spec);
  return t ? { value: t, position: 'insideBottom', offset: -14, fill: 'var(--color-ink-soft)', fontSize: 12 } : undefined;
}
function yAxisLabel(spec?: AxisSpec): any {
  const t = axisTitle(spec);
  return t ? { value: t, angle: -90, position: 'insideLeft', fill: 'var(--color-ink-soft)', fontSize: 12, style: { textAnchor: 'middle' } } : undefined;
}

function padDomain(lo: number, hi: number, frac = 0.08): [number, number] {
  if (lo === hi) return [lo - 1, hi + 1];
  const pad = (hi - lo) * frac;
  return [lo - pad, hi + pad];
}

// referenceLines / referenceAreas / annotations を Recharts 要素に変換する。
function refElements(config: SampleChartConfig, opts: { allowX: boolean; allowAnnotations: boolean }): ReactElement[] {
  const out: ReactElement[] = [];
  const rls = 'referenceLines' in config ? config.referenceLines : [];
  const ras = 'referenceAreas' in config ? config.referenceAreas : [];
  const ans = 'annotations' in config ? config.annotations : [];

  rls.forEach((rl, i) => {
    if (rl.axis === 'x' && !opts.allowX) return;
    const color = tokenToVar(rl.color, 'gold');
    out.push(
      <ReferenceLine
        key={`rl-${i}`}
        {...(rl.axis === 'y' ? { y: rl.value } : { x: rl.value })}
        stroke={color}
        strokeWidth={1.6}
        strokeDasharray={rl.dashed ? '5 4' : undefined}
        ifOverflow="extendDomain"
        label={rl.label ? { value: rl.label, position: rl.axis === 'y' ? 'right' : 'top', fill: color, fontSize: 11, fontWeight: 700 } : undefined}
      />,
    );
  });

  ras.forEach((ra, i) => {
    if (ra.axis === 'x' && !opts.allowX) return;
    const color = tokenToVar(ra.color, 'water');
    out.push(
      <ReferenceArea
        key={`ra-${i}`}
        {...(ra.axis === 'y' ? { y1: ra.from, y2: ra.to } : { x1: ra.from, x2: ra.to })}
        fill={color}
        fillOpacity={0.13}
        stroke={color}
        strokeOpacity={0.35}
        ifOverflow="extendDomain"
        label={ra.label ? { value: ra.label, fill: color, fontSize: 11 } : undefined}
      />,
    );
  });

  if (opts.allowAnnotations) {
    ans.forEach((a, i) => {
      const color = tokenToVar(a.color, 'signal-deep');
      const pos = a.place === 'bottom' ? 'bottom' : a.place === 'left' ? 'left' : a.place === 'right' ? 'right' : 'top';
      out.push(
        <ReferenceDot
          key={`an-${i}`}
          x={a.x}
          y={a.y}
          r={4}
          fill={color}
          stroke="var(--color-card)"
          strokeWidth={1.5}
          ifOverflow="extendDomain"
          label={{ value: a.label, position: pos, fill: color, fontSize: 11, fontWeight: 700 }}
        />,
      );
    });
  }
  return out;
}

function buildChart(config: SampleChartConfig, dims?: { width: number; height: number }): ReactElement {
  const sized = dims ? { width: dims.width, height: dims.height } : {};
  const xSpec = 'x' in config ? config.x : undefined;
  const ySpec = 'y' in config ? config.y : undefined;
  const TipContent = makeTooltip(xSpec, ySpec, { boxplot: config.type === 'boxplot' });
  const cursor = { stroke: 'var(--color-line-strong)', strokeDasharray: '4 4' } as const;
  const legendStyle = { color: 'var(--color-ink-soft)', fontSize: 12 } as const;

  // ---------- boxplot ----------
  if (config.type === 'boxplot') {
    const all = config.boxes.flatMap((b) => [b.min, b.max]);
    const [dlo, dhi] = padDomain(Math.min(...all), Math.max(...all), 0.12);
    const single = config.boxes.length === 1;
    return (
      <ComposedChart {...sized} data={config.boxes} margin={CHART_MARGIN}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" type="category" axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={xAxisLabel(xSpec)} />
        <YAxis type="number" domain={[dlo, dhi]} ticks={niceTicks(dlo, dhi, 6)} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={yAxisLabel(ySpec)} />
        <Tooltip content={<TipContent />} cursor={{ fill: 'var(--color-paper2)', fillOpacity: 0.4 }} />
        {refElements(config, { allowX: false, allowAnnotations: false })}
        <Bar dataKey={(d: { q1: number; q3: number }) => [d.q1, d.q3]} isAnimationActive={false} shape={(p: object) => <BoxShape {...p} showValues={single} />} />
      </ComposedChart>
    );
  }

  // ---------- bar / histogram ----------
  if (config.type === 'bar' || config.type === 'histogram') {
    const cats = config.type === 'bar' ? config.categories : undefined;
    const xvals = config.series[0].points.map((p) => p[0]);
    const rows = xvals.map((xv, i) => {
      const row: Record<string, number | string> = { x: xv, name: cats?.[i] ?? `${xv}` };
      config.series.forEach((s, si) => { row[`v${si}`] = s.points[i]?.[1] ?? 0; });
      return row;
    });
    const isHist = config.type === 'histogram';
    const multi = config.series.length > 1;
    // 強調色（annotations の x に一致する棒を signal-deep に）。
    const emphasis = new Set(('annotations' in config ? config.annotations : []).map((a) => a.x));
    return (
      <ComposedChart {...sized} data={rows} margin={CHART_MARGIN} barCategoryGap={isHist ? 1 : '20%'} barGap={2}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" type="category" axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={xAxisLabel(xSpec)} />
        <YAxis type="number" tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={yAxisLabel(ySpec)} />
        <Tooltip content={<TipContent />} cursor={{ fill: 'var(--color-paper2)', fillOpacity: 0.4 }} />
        {multi && <Legend wrapperStyle={legendStyle} />}
        {refElements(config, { allowX: false, allowAnnotations: false })}
        {config.series.map((s, si) => (
          <Bar key={si} dataKey={`v${si}`} name={s.label ?? `系列${si + 1}`} fill={seriesColor(si, s.color)} isAnimationActive={false} radius={[2, 2, 0, 0]}>
            {!multi && rows.map((r, ri) => (
              <Cell key={ri} fill={emphasis.has(Number(r.x)) ? 'var(--color-signal-deep)' : seriesColor(si, s.color)} />
            ))}
          </Bar>
        ))}
      </ComposedChart>
    );
  }

  // ---------- logistic ----------
  if (config.type === 'logistic') {
    const xs = config.points.map((p) => p[0]);
    const [xlo, xhi] = padDomain(Math.min(...xs), Math.max(...xs), 0.05);
    const steps = 48;
    const curve = Array.from({ length: steps + 1 }, (_, i) => {
      const x = xlo + ((xhi - xlo) * i) / steps;
      return { x, p: 1 / (1 + Math.exp(-(config.curve.b0 + config.curve.b1 * x))) };
    });
    const obs = config.points.map(([x, y]) => ({ x, y }));
    const boundary = config.curve.b1 === 0 ? 0 : -config.curve.b0 / config.curve.b1;
    return (
      <ComposedChart {...sized} data={curve} margin={CHART_MARGIN}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" domain={[xlo, xhi]} ticks={niceTicks(xlo, xhi, 6)} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={xAxisLabel(xSpec)} />
        <YAxis type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={yAxisLabel(ySpec)} />
        <Tooltip content={<TipContent />} cursor={cursor} />
        <ReferenceLine y={config.threshold} stroke="var(--color-gold)" strokeDasharray="5 4" strokeWidth={1.6} label={{ value: `しきい値 ${config.threshold}`, position: 'right', fill: 'var(--color-gold)', fontSize: 11, fontWeight: 700 }} />
        <ReferenceLine x={boundary} stroke="var(--color-ink-faint)" strokeDasharray="3 3" label={{ value: `境界 x=${Math.round(boundary * 10) / 10}`, position: 'top', fill: 'var(--color-ink-faint)', fontSize: 10 }} />
        {refElements(config, { allowX: true, allowAnnotations: true })}
        <Line dataKey="p" stroke="var(--color-signal)" strokeWidth={2.4} dot={false} isAnimationActive={false} name="合格確率" />
        <Scatter data={obs} dataKey="y" fill="var(--color-water)" name="実測(0/1)" isAnimationActive={false} />
      </ComposedChart>
    );
  }

  // ---------- line ----------
  if (config.type === 'line') {
    // 系列ごとに別 data。x ドメインを共有させるため数値軸で明示。
    const allX = config.series.flatMap((s) => s.points.map((p) => p[0]));
    const allY = config.series.flatMap((s) => s.points.map((p) => p[1]));
    const [xlo, xhi] = padDomain(Math.min(...allX), Math.max(...allX), 0.02);
    const [ylo, yhi] = padDomain(Math.min(...allY), Math.max(...allY));
    const multi = config.series.length > 1;
    return (
      <ComposedChart {...sized} margin={CHART_MARGIN}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" domain={[xlo, xhi]} ticks={niceTicks(xlo, xhi, 6)} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={xAxisLabel(xSpec)} allowDuplicatedCategory={false} />
        <YAxis type="number" domain={[ylo, yhi]} ticks={niceTicks(ylo, yhi, 6)} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={yAxisLabel(ySpec)} />
        <Tooltip content={<TipContent />} cursor={cursor} />
        {multi && <Legend wrapperStyle={legendStyle} />}
        {refElements(config, { allowX: true, allowAnnotations: true })}
        {config.series.map((s, si) => (
          <Line key={si} data={toRows(s.points)} dataKey="y" name={s.label ?? `系列${si + 1}`} stroke={seriesColor(si, s.color)} strokeWidth={2.2} dot={{ r: 2.5, fill: seriesColor(si, s.color), stroke: 'none' }} activeDot={{ r: 4 }} isAnimationActive={false} />
        ))}
      </ComposedChart>
    );
  }

  // ---------- scatter (+ optional fit) ----------
  // diagram 型は MethodDiagram が描くため buildChart には届かない。型を scatter に絞る。
  if (config.type !== 'scatter') return <></>;
  const allX = config.series.flatMap((s) => s.points.map((p) => p[0]));
  const allY = config.series.flatMap((s) => s.points.map((p) => p[1]));
  const [xlo, xhi] = padDomain(Math.min(...allX), Math.max(...allX));
  const [ylo, yhi] = padDomain(Math.min(...allY), Math.max(...allY));
  const multi = config.series.length > 1;
  let fitEl: ReactElement | null = null;
  if (config.fit) {
    const pts = config.series.flatMap((s) => s.points) as [number, number][];
    const { slope, intercept, r2 } = linearFit(pts);
    const x0 = Math.min(...allX);
    const x1 = Math.max(...allX);
    const seg: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: x0, y: slope * x0 + intercept },
      { x: x1, y: slope * x1 + intercept },
    ];
    const lbl = config.fitLabel ?? `回帰直線（R²=${(Math.round(r2 * 100) / 100)}）`;
    fitEl = (
      <ReferenceLine
        segment={seg}
        stroke="var(--color-signal-deep)"
        strokeWidth={2}
        ifOverflow="extendDomain"
        label={{ value: lbl, position: 'insideTopLeft', fill: 'var(--color-signal-deep)', fontSize: 11, fontWeight: 700 }}
      />
    );
  }
  return (
    <ComposedChart {...sized} margin={CHART_MARGIN}>
      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
      <XAxis dataKey="x" type="number" domain={[xlo, xhi]} ticks={niceTicks(xlo, xhi, 6)} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={xAxisLabel(xSpec)} />
      <YAxis dataKey="y" type="number" domain={[ylo, yhi]} ticks={niceTicks(ylo, yhi, 6)} tickFormatter={fmtTick} axisLine={axisLine} tickLine={tickLine} tick={tickStyle} label={yAxisLabel(ySpec)} />
      <Tooltip content={<TipContent />} cursor={cursor} />
      {multi && <Legend wrapperStyle={legendStyle} />}
      {refElements(config, { allowX: true, allowAnnotations: true })}
      {fitEl}
      {config.series.map((s, si) => (
        <Scatter key={si} data={toRows(s.points)} dataKey="y" name={s.label ?? `系列${si + 1}`} fill={seriesColor(si, s.color)} isAnimationActive={false} />
      ))}
    </ComposedChart>
  );
}

export default function SampleChart({ config, width, height = CHART_H }: Props): ReactElement {
  const caption = config.caption;
  const inner = width != null
    ? buildChart(config, { width, height })
    : (
      <ResponsiveContainer width="100%" height={height}>
        {buildChart(config)}
      </ResponsiveContainer>
    );
  return (
    <figure className="my-4">
      <div className="w-full max-w-[680px]" role="img" aria-label={caption ?? 'サンプルデータのグラフ'}>
        {inner}
      </div>
      {caption && (
        <figcaption className="mt-2 font-mono text-xs text-ink-faint">{caption}</figcaption>
      )}
    </figure>
  );
}
