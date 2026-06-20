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
