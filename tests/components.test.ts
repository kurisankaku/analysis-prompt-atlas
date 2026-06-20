// tests/components.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SiteHeader from '../src/components/SiteHeader.astro';
import MethodCard from '../src/components/MethodCard.astro';
import RegionCard from '../src/components/RegionCard.astro';
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
