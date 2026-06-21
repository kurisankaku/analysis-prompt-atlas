// tests/charts/sample-chart.test.tsx
// Recharts アイランド SampleChart の構造とテーマ規律を検証する。
// 固定寸法（width/height）で描画して ResponsiveContainer を回避する。
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import SampleChart from '../../src/components/charts/SampleChart';
import { makeTooltip } from '../../src/components/charts/ChartTooltip';
import type { SampleChartConfig } from '../../src/content/schema';

beforeAll(() => {
  // jsdom には ResizeObserver が無い。Recharts が参照しても落ちないよう補う。
  (globalThis as any).ResizeObserver ||= class {
    observe() {} unobserve() {} disconnect() {}
  };
});

const D = { width: 640, height: 380 };

const scatterCfg: SampleChartConfig = {
  type: 'scatter',
  fit: true,
  caption: '広告費と売上は強い正の相関',
  x: { label: '広告費', unit: '万円' },
  y: { label: '売上', unit: '万円' },
  series: [{ label: '広告費と売上', points: [[10, 120], [20, 165], [30, 210], [40, 250]] }],
  referenceLines: [{ axis: 'y', value: 180, label: '平均', color: 'gold', dashed: true }],
  referenceAreas: [],
  annotations: [],
} as SampleChartConfig;

const barCfg: SampleChartConfig = {
  type: 'bar',
  grouped: false,
  caption: '5人の点数。平均は80点。',
  x: { label: '生徒' },
  y: { label: '点数', unit: '点' },
  categories: ['A', 'B', 'C', 'D', 'E'],
  series: [{ label: '点数', points: [[1, 60], [2, 70], [3, 80], [4, 90], [5, 100]] }],
  referenceLines: [{ axis: 'y', value: 80, label: '平均80点', color: 'gold', dashed: true }],
  referenceAreas: [],
  annotations: [],
} as SampleChartConfig;

const boxCfg: SampleChartConfig = {
  type: 'boxplot',
  caption: '所要時間の5数要約',
  y: { label: '所要時間', unit: '分' },
  boxes: [{ label: '全体', min: 10, q1: 15, median: 22, q3: 30, max: 45 }],
  referenceLines: [],
  referenceAreas: [],
  annotations: [],
} as SampleChartConfig;

const logisticCfg: SampleChartConfig = {
  type: 'logistic',
  caption: '勉強時間と合格確率',
  x: { label: '勉強時間', unit: '時間' },
  y: { label: '合格確率' },
  points: [[1, 0], [2, 0], [4, 0], [5, 1], [7, 1], [8, 1]],
  curve: { b0: -3, b1: 0.8 },
  threshold: 0.5,
  referenceLines: [],
  referenceAreas: [],
  annotations: [],
} as SampleChartConfig;

const lineCfg: SampleChartConfig = {
  type: 'line',
  caption: '元の売上と3日移動平均',
  x: { label: '日', unit: '日目' },
  y: { label: '売上', unit: '万円' },
  series: [
    { label: '元の売上', color: 'line-strong', points: [[1, 100], [2, 120], [3, 80], [4, 140]] },
    { label: '3日移動平均', color: 'signal', points: [[1, 100], [2, 110], [3, 100], [4, 113]] },
  ],
  referenceLines: [],
  referenceAreas: [],
  annotations: [],
} as SampleChartConfig;

const all = { scatter: scatterCfg, bar: barCfg, boxplot: boxCfg, logistic: logisticCfg, line: lineCfg };

describe('SampleChart 構造', () => {
  it('SVG と軸の数値目盛りを描く（散布図）', () => {
    const { container } = render(<SampleChart config={scatterCfg} {...D} />);
    expect(container.querySelector('svg')).toBeTruthy();
    // 数値目盛りテキストが出ている（軸に具体的な数値がある）
    expect(container.querySelectorAll('.recharts-cartesian-axis-tick').length).toBeGreaterThan(0);
  });

  it('基準線（平均線）を描く', () => {
    const { container } = render(<SampleChart config={scatterCfg} {...D} />);
    expect(container.querySelector('.recharts-reference-line')).toBeTruthy();
    expect(container.innerHTML).toContain('平均');
  });

  it('回帰直線（fit）の R² ラベルを描く', () => {
    const { container } = render(<SampleChart config={scatterCfg} {...D} />);
    expect(container.innerHTML).toContain('R²');
  });

  it('軸ラベル＋単位を描く', () => {
    const { container } = render(<SampleChart config={scatterCfg} {...D} />);
    expect(container.innerHTML).toContain('広告費（万円）');
    expect(container.innerHTML).toContain('売上（万円）');
  });

  it('複数系列で凡例を描く（折れ線）', () => {
    const { container } = render(<SampleChart config={lineCfg} {...D} />);
    expect(container.querySelector('.recharts-legend-wrapper')).toBeTruthy();
    expect(container.innerHTML).toContain('3日移動平均');
  });

  it('箱ひげ図は5数要約のラベルを描く', () => {
    const { container } = render(<SampleChart config={boxCfg} {...D} />);
    expect(container.innerHTML).toContain('中央 22');
    expect(container.innerHTML).toContain('Q3 30');
  });

  it('ロジスティックはしきい値線を描く', () => {
    const { container } = render(<SampleChart config={logisticCfg} {...D} />);
    expect(container.innerHTML).toContain('しきい値');
  });
});

describe('テーマ規律（生hex不使用）', () => {
  // Recharts は SSR では空で、マウント後（jsdom クライアント描画）に SVG を出す。
  // 実際に描かれた DOM に対して色規律を検証する。
  for (const [name, cfg] of Object.entries(all)) {
    it(`${name}: var(--color-) を使い、生の16進カラーを含まない`, () => {
      const { container } = render(<SampleChart config={cfg as SampleChartConfig} {...D} />);
      const html = container.innerHTML;
      expect(html).toContain('var(--color-');
      expect(html).not.toMatch(/#[0-9A-Fa-f]{3,6}\b/);
    });
  }
});

describe('ChartTooltip', () => {
  it('ホバー時に実値＋単位を表示する', () => {
    const Tip = makeTooltip({ label: '広告費', unit: '万円' }, { label: '売上', unit: '万円' });
    const html = renderToStaticMarkup(<Tip active payload={[{ payload: { x: 20, y: 165, name: '広告費と売上' } }]} />);
    expect(html).toContain('広告費');
    expect(html).toContain('20万円');
    expect(html).toContain('165万円');
    expect(html).not.toMatch(/#[0-9A-Fa-f]{3,6}\b/);
  });
  it('非アクティブ時は何も描かない', () => {
    const Tip = makeTooltip();
    const html = renderToStaticMarkup(<Tip active={false} payload={[]} />);
    expect(html).toBe('');
  });
  it('箱ひげ用ツールチップは5数を表示する', () => {
    const Tip = makeTooltip(undefined, undefined, { boxplot: true });
    const html = renderToStaticMarkup(
      <Tip active payload={[{ payload: { label: '全体', min: 10, q1: 15, median: 22, q3: 30, max: 45 } }]} />,
    );
    expect(html).toContain('中央 22');
    expect(html).toContain('最大 45');
  });
});
