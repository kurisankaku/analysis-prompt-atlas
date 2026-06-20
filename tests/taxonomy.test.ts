import { describe, it, expect } from 'vitest';
import { PURPOSES, DATA_TYPES, MATH_CATS, purposeBySlug, methodsByPurpose } from '../src/lib/taxonomy';
import { PURPOSE_CATEGORIES, DATA_CATEGORIES, MATH_CATEGORIES } from '../src/content/schema';
import { sampleMethod } from './fixtures/sample-method';

describe('taxonomy', () => {
  it('各軸の件数が統制語彙と一致する', () => {
    expect(PURPOSES).toHaveLength(15);
    expect(DATA_TYPES).toHaveLength(11);
    expect(MATH_CATS).toHaveLength(15);
  });

  it('ラベルが統制語彙(schema)と完全一致する', () => {
    expect(PURPOSES.map((p) => p.label)).toEqual([...PURPOSE_CATEGORIES]);
    expect(DATA_TYPES.map((d) => d.label)).toEqual([...DATA_CATEGORIES]);
    expect(MATH_CATS.map((m) => m.label)).toEqual([...MATH_CATEGORIES]);
  });

  it('slug は一意でASCII', () => {
    const slugs = [...PURPOSES, ...DATA_TYPES, ...MATH_CATS].map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('全エントリに説明がある', () => {
    for (const e of [...PURPOSES, ...DATA_TYPES, ...MATH_CATS]) expect(e.description.length).toBeGreaterThan(0);
  });

  it('purposeBySlug が引ける', () => {
    expect(purposeBySlug('relationship')?.label).toBe('関係性を知りたい');
    expect(purposeBySlug('nope')).toBeUndefined();
  });

  it('methodsByPurpose が目的ラベルで絞り込む', () => {
    const methods = [sampleMethod] as any;
    expect(methodsByPurpose(methods, '傾向を知りたい')).toHaveLength(1);
    expect(methodsByPurpose(methods, '異常を見つけたい')).toHaveLength(0);
  });
});
