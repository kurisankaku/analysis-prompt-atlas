// src/components/charts/parts/BoxPlot.tsx
// Recharts には箱ひげ図が無いため、浮動 Bar（dataKey=[q1,q3]）の custom shape として
// 箱・ひげ・中央値線・数値ラベルを描く。色はすべて @theme トークン（生hex不使用）。
import type { ReactElement } from 'react';
import { tokenToVar } from '../../../lib/chart-config';
import type { ChartColor } from '../../../content/schema';

type BoxRow = {
  label: string;
  min: number; q1: number; median: number; q3: number; max: number;
  color?: ChartColor;
};

type ShapeProps = {
  x?: number; y?: number; width?: number; height?: number;
  payload?: BoxRow;
  showValues?: boolean;
};

const fmt = (v: number) => (Math.round(v * 100) / 100).toLocaleString('ja-JP');

// Bar の floating shape。y..y+height が q3..q1 に対応する前提でピクセル尺度を逆算する。
export function BoxShape(props: ShapeProps): ReactElement | null {
  const { x, y, width, height, payload, showValues } = props;
  if (
    x == null || y == null || width == null || height == null || !payload ||
    width <= 0
  ) {
    return null;
  }
  const { min, q1, median, q3, max } = payload;
  const stroke = tokenToVar(payload.color, 'water');
  const span = q3 - q1;
  const pxPerUnit = span === 0 ? 0 : height / span;
  const yOf = (val: number) => y + (q3 - val) * pxPerUnit;
  const yMax = yOf(max);
  const yMin = yOf(min);
  const yMed = yOf(median);
  const cx = x + width / 2;
  const capHalf = (width * 0.5) / 2;

  const labelX = x + width + 6;
  const label = (yy: number, text: string, key: string) => (
    <text
      key={key}
      x={labelX}
      y={yy + 3}
      fontFamily="var(--font-mono)"
      fontSize="10"
      fill="var(--color-ink-faint)"
    >
      {text}
    </text>
  );

  return (
    <g stroke={stroke} fill="none" strokeWidth={1.5}>
      {/* ひげ（上下） */}
      <line x1={cx} y1={yMax} x2={cx} y2={y} />
      <line x1={cx} y1={y + height} x2={cx} y2={yMin} />
      {/* ひげの先のキャップ */}
      <line x1={cx - capHalf} y1={yMax} x2={cx + capHalf} y2={yMax} />
      <line x1={cx - capHalf} y1={yMin} x2={cx + capHalf} y2={yMin} />
      {/* 箱（Q1〜Q3） */}
      <rect x={x} y={y} width={width} height={height} fill={stroke} fillOpacity={0.16} />
      {/* 中央値 */}
      <line x1={x} y1={yMed} x2={x + width} y2={yMed} strokeWidth={2.4} />
      {showValues && (
        <g stroke="none">
          {label(yMax, `最大 ${fmt(max)}`, 'mx')}
          {label(yOf(q3), `Q3 ${fmt(q3)}`, 'q3')}
          {label(yMed, `中央 ${fmt(median)}`, 'md')}
          {label(yOf(q1), `Q1 ${fmt(q1)}`, 'q1')}
          {label(yMin, `最小 ${fmt(min)}`, 'mn')}
        </g>
      )}
    </g>
  );
}
