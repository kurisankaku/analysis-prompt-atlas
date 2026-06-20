// tests/components.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SiteHeader from '../src/components/SiteHeader.astro';
import MethodCard from '../src/components/MethodCard.astro';
import RegionCard from '../src/components/RegionCard.astro';
import HubView from '../src/components/HubView.astro';
import ComparisonTable from '../src/components/ComparisonTable.astro';
import MethodChart from '../src/components/MethodChart.astro';
import { sampleMethod } from './fixtures/sample-method';

describe('SiteHeader', () => {
  it('ブランドと主要ナビを描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SiteHeader, { props: {} });
    expect(html).toContain('分析手法アトラス');
    expect(html).toContain('目的から');
    expect(html).toContain('データ種類');
    expect(html).toContain('分類');
    expect(html).toContain('関係マップ');
    expect(html).toContain('href="/"'); // ブランド/目的ホームへのリンク
  });

  it('active 一致のナビ項目に signal の下線を付ける', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SiteHeader, {
      props: { active: '目的から' },
    });
    // active 項目（目的から / href="/"）に border-signal が付与される
    expect(html).toMatch(/href="\/"[^>]*border-signal/);
  });
});

describe('MethodCard', () => {
  it('手法名・一言・難易度・詳細リンクを描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodCard, {
      props: { method: sampleMethod, id: 'mean' },
    });
    expect(html).toContain(sampleMethod.name);
    expect(html).toContain(sampleMethod.oneLiner);
    expect(html).toContain(sampleMethod.difficulty);
    expect(html).toContain('/methods/mean'); // 詳細リンク（id はコレクションキー）
  });
});

describe('RegionCard', () => {
  it('R番号・件数・ラベル・説明・目的リンクを描画する', async () => {
    const c = await AstroContainer.create();
    const entry = {
      slug: 'relationship',
      label: '関係性を知りたい',
      description: '変数どうしの結びつきを調べる。',
    };
    const html = await c.renderToString(RegionCard, {
      props: { entry, code: 'R03', count: 8 },
    });
    expect(html).toContain('R03');
    expect(html).toContain('関係性を知りたい');
    expect(html).toContain('8');
    expect(html).toContain('/purpose/relationship');
  });
});

describe('HubView', () => {
  it('手法があれば軸コード・タイトル・カードを描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(HubView, {
      props: {
        code: 'R03',
        axisLabel: '分析目的',
        title: '関係性を知りたい',
        description: '変数どうしの結びつきを調べる。',
        items: [{ id: 'mean', data: sampleMethod }],
      },
    });
    expect(html).toContain('R03'); // 軸コードチップ
    expect(html).toContain('分析目的'); // 軸ラベル
    expect(html).toContain('関係性を知りたい'); // タイトル
    expect(html).toContain(sampleMethod.name); // カード（手法名）
    expect(html).toContain('/methods/mean'); // カードの詳細リンク
    expect(html).not.toContain('該当する手法はまだありません'); // 空状態は出ない
  });

  it('手法がなければ空状態を描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(HubView, {
      props: {
        code: 'D05',
        axisLabel: 'データ種類',
        title: '画像データ',
        description: '写真・図などの画像。',
        items: [],
      },
    });
    expect(html).toContain('画像データ'); // タイトルは出る
    expect(html).toContain('該当する手法はまだありません'); // 空状態
    expect(html).not.toContain(sampleMethod.name); // カードは出ない
  });
});

describe('ComparisonTable', () => {
  it('各手法を列に、比較項目を行に描画する', async () => {
    const c = await AstroContainer.create();
    const items = [
      { id: 'mean', data: sampleMethod },
      {
        id: 'median',
        data: { ...sampleMethod, name: '中央値', oneLiner: '真ん中の値', difficulty: '初級' },
      },
    ];
    const html = await c.renderToString(ComparisonTable, { props: { items } });
    // 手法名（列見出し）と詳細リンク
    expect(html).toContain('平均');
    expect(html).toContain('中央値');
    expect(html).toContain('/methods/mean');
    expect(html).toContain('/methods/median');
    // 行ラベル
    expect(html).toContain('一言でいうと');
    expect(html).toContain('向いているデータ');
    expect(html).toContain('得られる結果');
    expect(html).toContain('難易度');
    expect(html).toContain('注意点');
    // 値
    expect(html).toContain(sampleMethod.oneLiner);
    expect(html).toContain('真ん中の値');
  });
});

describe('MethodChart', () => {
  const make = (type: string) => ({
    type,
    caption: 'cap',
    series: [{ label: 's', points: [[1, 60], [2, 70], [3, 80]] }],
  });

  it('bar はSVGに矩形を描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('bar') } });
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
    expect(html).toContain('cap'); // caption
  });

  it('histogram はSVGに矩形を描く（bar と同じ描画）', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('histogram') } });
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
  });

  it('scatter はSVGに円を描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('scatter') } });
    expect(html).toContain('<svg');
    expect(html).toContain('<circle');
  });

  it('line は折れ線(polyline)を描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('line') } });
    expect(html).toContain('<svg');
    expect(html).toContain('<polyline');
  });

  it('未対応種別(box)はフォールバック文言', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('box') } });
    expect(html).toContain('準備中');
  });

  it('未対応種別(heatmap)はフォールバック文言', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('heatmap') } });
    expect(html).toContain('準備中');
  });

  it('テーマ変数で色を指定し、生の16進カラーを使わない', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodChart, { props: { chart: make('scatter') } });
    expect(html).toContain('var(--color-signal)');
    // 生の hex カラー（#RGB/#RRGGBB）は含めない
    expect(html).not.toMatch(/#[0-9A-Fa-f]{3,6}\b/);
  });
});
