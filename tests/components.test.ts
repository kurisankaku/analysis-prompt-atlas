// tests/components.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SiteHeader from '../src/components/SiteHeader.astro';

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
