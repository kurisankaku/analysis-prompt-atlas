// tests/code.test.ts
// MethodCode（プログラムで計算する）の描画を検証する。
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MethodCode from '../src/components/MethodCode.astro';

describe('MethodCode', () => {
  it('Pythonコードをハイライトし、コメント・コピーボタンを描く', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MethodCode, {
      props: {
        code: {
          lang: 'python',
          note: 'statistics を使用',
          code: 'import statistics\nscores = [60, 70, 80]  # 例データ\nprint(statistics.mean(scores))  # 平均',
        },
      },
    });
    expect(html).toContain('プログラムで計算する（Python）');
    expect(html).toContain('statistics');     // コード本体
    expect(html).toContain('例データ');        // コード内コメント
    expect(html).toContain('shiki');           // Shiki でハイライト
    expect(html).toContain('コピー');          // コピーボタン
    expect(html).toContain('data-code');       // コピー対象を保持
  });
});
