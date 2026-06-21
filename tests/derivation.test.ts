// tests/derivation.test.ts
// 計算の手順（derivation）の数式が KaTeX で確実に描画できることを中央で検証する。
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import katex from 'katex';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MathFormula from '../src/components/MathFormula.astro';
import DerivationSteps from '../src/components/DerivationSteps.astro';

const DIR = join(process.cwd(), 'src/content/methods');
const entries = readdirSync(DIR)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => ({ id: f.replace(/\.yaml$/, ''), data: parse(readFileSync(join(DIR, f), 'utf-8')) }));

describe('MathFormula', () => {
  it('LaTeX を KaTeX でHTML化する（katex クラスを含む）', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(MathFormula, {
      props: { tex: '\\bar{x} = \\frac{a}{b}', display: true },
    });
    expect(html).toContain('katex');
  });
});

describe('DerivationSteps', () => {
  it('見出し・記号・手順・数値例を描画する', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(DerivationSteps, {
      props: {
        derivation: {
          intro: 'テスト導入',
          symbols: [{ sym: 'n', meaning: 'データの個数' }],
          steps: [
            { formula: '\\bar{x}=\\frac{1}{n}\\sum x_i', explain: '説明文', example: '\\frac{400}{5}=80', result: '80点' },
          ],
        },
      },
    });
    expect(html).toContain('計算の手順');
    expect(html).toContain('記号の意味');
    expect(html).toContain('データの個数');
    expect(html).toContain('数字で確認');
    expect(html).toContain('katex');
  });
});

describe('全手法の derivation の LaTeX が有効', () => {
  const withDeriv = entries.filter((e) => e.data?.derivation);
  it('少なくとも1件の derivation がある', () => {
    expect(withDeriv.length).toBeGreaterThanOrEqual(1);
  });
  for (const e of withDeriv) {
    it(`${e.id}: すべての数式が KaTeX で解釈できる`, () => {
      const d = e.data.derivation;
      const texts: string[] = [];
      for (const s of d.symbols ?? []) texts.push(s.sym);
      for (const st of d.steps) {
        texts.push(st.formula);
        if (st.example) texts.push(st.example);
      }
      for (const t of texts) {
        expect(
          () => katex.renderToString(t, { throwOnError: true, strict: 'ignore' }),
          `${e.id}: 不正なLaTeX → ${t}`,
        ).not.toThrow();
      }
    });
  }
});
