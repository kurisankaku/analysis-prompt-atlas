// tests/search.test.ts
import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchMethods } from '../src/lib/search';
import { sampleMethod } from './fixtures/sample-method';

const docs = buildSearchIndex([
  { id: 'mean', data: sampleMethod },
  { id: 'median', data: { ...sampleMethod, name: '中央値', reading: 'ちゅうおうち', english: 'Median', oneLiner: '真ん中の値', keywords: ['median', '中央値'], difficulty: '初級' } as any },
]);

describe('buildSearchIndex', () => {
  it('必要フィールドを写す', () => {
    const d = docs.find((x) => x.id === 'mean')!;
    expect(d.name).toBe('平均');
    expect(d.difficulty).toBe('基礎');
    expect(d.keywords).toContain('mean');
  });
});

describe('searchMethods', () => {
  it('空クエリは全件（難易度フィルタなし）', () => {
    expect(searchMethods(docs, { query: '', difficulties: [] })).toHaveLength(2);
  });
  it('読み・英語・名前でヒットする', () => {
    expect(searchMethods(docs, { query: 'へいきん', difficulties: [] }).map((d) => d.id)).toContain('mean');
    expect(searchMethods(docs, { query: 'median', difficulties: [] }).map((d) => d.id)).toContain('median');
    expect(searchMethods(docs, { query: '平均', difficulties: [] }).map((d) => d.id)).toContain('mean');
  });
  it('難易度フィルタで絞り込む', () => {
    expect(searchMethods(docs, { query: '', difficulties: ['初級'] }).map((d) => d.id)).toEqual(['median']);
  });
  it('該当なしは空配列', () => {
    expect(searchMethods(docs, { query: 'xyzzy該当しない', difficulties: [] })).toHaveLength(0);
  });
});
