// tests/schema.test.ts
import { describe, it, expect } from 'vitest';
import { methodSchema } from '../src/content/schema';
import { sampleMethod } from './fixtures/sample-method';

describe('methodSchema', () => {
  it('正しい手法データを受理する', () => {
    expect(() => methodSchema.parse(sampleMethod)).not.toThrow();
  });

  it('不正な難易度を拒否する', () => {
    const bad = { ...sampleMethod, difficulty: '簡単' };
    expect(() => methodSchema.parse(bad)).toThrow();
  });

  it('不正な分析目的カテゴリを拒否する', () => {
    const bad = { ...sampleMethod, purposeCategories: ['存在しない目的'] };
    expect(() => methodSchema.parse(bad)).toThrow();
  });

  it('不正な関係タイプを拒否する', () => {
    const bad = {
      ...sampleMethod,
      related: [{ id: 'median', type: 'にている' }],
    };
    expect(() => methodSchema.parse(bad)).toThrow();
  });

  it('必須項目の欠落を拒否する（oneLinerなし）', () => {
    const { oneLiner, ...bad } = sampleMethod;
    expect(() => methodSchema.parse(bad)).toThrow();
  });
});

describe('sampleChartSchema（図の定義）', () => {
  const withChart = (chart: unknown) => ({ ...sampleMethod, sampleChart: chart });

  it('散布図＋回帰直線＋軸ラベル＋基準線を受理し、既定値を補う', () => {
    const parsed = methodSchema.parse(withChart({
      type: 'scatter',
      fit: true,
      x: { label: '気温', unit: '℃' },
      y: { label: '売上', unit: '万円' },
      series: [{ label: '気温と売上', points: [[10, 120], [20, 180]] }],
      referenceLines: [{ axis: 'y', value: 150, label: '平均' }],
    }));
    const c = parsed.sampleChart as any;
    expect(c.type).toBe('scatter');
    // referenceLines の color/dashed に既定値が入る
    expect(c.referenceLines[0].color).toBe('gold');
    expect(c.referenceLines[0].dashed).toBe(true);
    // annotations / referenceAreas は既定で空配列
    expect(c.annotations).toEqual([]);
  });

  it('箱ひげ図（5数要約）を受理する', () => {
    expect(() => methodSchema.parse(withChart({
      type: 'boxplot',
      y: { label: '所要時間', unit: '分' },
      boxes: [{ label: '全体', min: 10, q1: 15, median: 22, q3: 30, max: 45 }],
    }))).not.toThrow();
  });

  it('決定木の模式図を受理する', () => {
    expect(() => methodSchema.parse(withChart({
      type: 'tree',
      root: { label: '晴れ？', children: [{ condition: 'はい', label: '来店', leaf: '来店' }] },
    }))).not.toThrow();
  });

  it('色トークン以外（生hex）を拒否する', () => {
    expect(() => methodSchema.parse(withChart({
      type: 'bar',
      series: [{ label: 's', color: '#D6336C', points: [[1, 2]] }],
    }))).toThrow();
  });

  it('旧 type（box/heatmap）と未知 type を拒否する', () => {
    expect(() => methodSchema.parse(withChart({ type: 'box', series: [{ points: [[1, 2]] }] }))).toThrow();
    expect(() => methodSchema.parse(withChart({ type: 'heatmap', series: [{ points: [[1, 2]] }] }))).toThrow();
    expect(() => methodSchema.parse(withChart({ type: 'wat', series: [{ points: [[1, 2]] }] }))).toThrow();
  });
});
