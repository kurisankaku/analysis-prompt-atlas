// tests/diagrams.test.ts
// 模式図（静的SVG）の構造とテーマ規律（生hex不使用）を検証する。
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MethodDiagram from '../src/components/diagrams/MethodDiagram.astro';

const noRawHex = (html: string) => {
  expect(html).toContain('var(--color-');
  expect(html).not.toMatch(/#[0-9A-Fa-f]{3,6}\b/);
};

const render = async (config: unknown) => {
  const c = await AstroContainer.create();
  return c.renderToString(MethodDiagram, { props: { config } });
};

describe('TreeDiagram', () => {
  const config = {
    type: 'tree',
    caption: '天気と気温で来店を分岐',
    root: {
      label: '晴れ？',
      children: [
        {
          condition: 'はい',
          label: '気温≥22℃？',
          children: [
            { condition: 'はい', label: '来店', leaf: '来店', leafColor: 'good' },
            { condition: 'いいえ', label: '不来店', leaf: '不来店', leafColor: 'signal' },
          ],
        },
        { condition: 'いいえ', label: '不来店', leaf: '不来店', leafColor: 'signal' },
      ],
    },
  };
  it('SVG・葉・枝ラベル・キャプションを描く', async () => {
    const html = await render(config);
    expect(html).toContain('<svg');
    expect(html).toContain('来店');
    expect(html).toContain('はい');
    expect(html).toContain('天気と気温で来店を分岐');
    noRawHex(html);
  });
  it('ensemble は多数決ラベルを描く', async () => {
    const html = await render({ ...config, ensemble: 3, result: '継続' });
    expect(html).toContain('多数決');
    expect(html).toContain('木1');
    noRawHex(html);
  });
});

describe('Dendrogram', () => {
  const config = {
    type: 'dendrogram',
    caption: '商品の併合と切る高さ',
    leaves: ['A', 'B', 'C', 'D'],
    merges: [
      { a: 'A', b: 'B', height: 1 },
      { a: 'C', b: 'D', height: 1.5 },
      { a: 0, b: 1, height: 3 },
    ],
    cut: 2,
    cutLabel: 'ここで切ると2群',
  };
  it('葉ラベル・カット線・高さ目盛りを描く', async () => {
    const html = await render(config);
    expect(html).toContain('<svg');
    expect(html).toContain('ここで切ると2群');
    expect(html).toContain('>A<');
    noRawHex(html);
  });
});

describe('VectorDiagram', () => {
  const config = {
    type: 'vectors',
    caption: '向きが近いほど似ている',
    x: { label: '猫' },
    y: { label: '犬' },
    vectors: [
      { label: '文章A', x: 3, y: 1, color: 'signal' },
      { label: '文章B', x: 2.6, y: 1.1, color: 'water' },
    ],
  };
  it('ベクトル・なす角・cosθ を描く', async () => {
    const html = await render(config);
    expect(html).toContain('<svg');
    expect(html).toContain('cosθ');
    expect(html).toContain('文章A');
    noRawHex(html);
  });
});

describe('Neighborhood', () => {
  const config = {
    type: 'neighborhood',
    caption: '近い3個で多数決',
    x: { label: '重さ', unit: 'g' },
    y: { label: '甘さ' },
    k: 3,
    query: { x: 5, y: 5 },
    points: [
      { x: 4, y: 5, cls: 'りんご' },
      { x: 6, y: 6, cls: 'りんご' },
      { x: 5, y: 4, cls: 'みかん' },
      { x: 9, y: 9, cls: 'みかん' },
    ],
  };
  it('クラス点・クエリ星・凡例を描く', async () => {
    const html = await render(config);
    expect(html).toContain('<svg');
    expect(html).toContain('りんご');
    expect(html).toContain('多数決');
    noRawHex(html);
  });
});

describe('ClustersDiagram', () => {
  const config = {
    type: 'clusters',
    caption: '3クラスタと重心',
    x: { label: '来店回数', unit: '回' },
    y: { label: '購入金額', unit: '千円' },
    clusters: [
      { label: '優良', color: 'signal', points: [[8, 9], [9, 8]], centroid: [8.5, 8.5] },
      { label: '一般', color: 'water', points: [[3, 3], [4, 2]], centroid: [3.5, 2.5] },
    ],
  };
  it('クラスタ点・重心・凡例を描く', async () => {
    const html = await render(config);
    expect(html).toContain('<svg');
    expect(html).toContain('重心');
    expect(html).toContain('優良');
    noRawHex(html);
  });
});
