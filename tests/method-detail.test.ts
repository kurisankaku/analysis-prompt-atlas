// tests/method-detail.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MethodDetail from '../src/components/MethodDetail.astro';
import { sampleMethod } from './fixtures/sample-method';

describe('MethodDetail', () => {
  it('§4の主要セクションと内容を描画する', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MethodDetail, {
      props: { method: sampleMethod },
    });

    // ヘッダ
    expect(html).toContain('平均');
    expect(html).toContain('へいきん');
    expect(html).toContain('基礎'); // 難易度バッジ
    // 各セクション見出し
    expect(html).toContain('これは何');
    expect(html).toContain('何が分かる');
    expect(html).toContain('どんなデータを用意する');
    expect(html).toContain('どんな時に使う');
    expect(html).toContain('結果の読み方');
    expect(html).toContain('使う前');
    expect(html).toContain('注意点');
    expect(html).toContain('関連手法');
    // 中身
    expect(html).toContain(sampleMethod.analogy);
    expect(html).toContain(sampleMethod.whatYouLearn);
    expect(html).toContain('生徒'); // ミニ例表の列見出し
  });
});
