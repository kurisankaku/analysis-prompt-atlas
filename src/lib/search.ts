// src/lib/search.ts
import Fuse from 'fuse.js';
import type { Method } from '../content/schema';

export type SearchDoc = {
  id: string; name: string; reading: string; english: string; oneLiner: string;
  keywords: string[]; difficulty: Method['difficulty'];
  purposes: string[]; dataTypes: string[]; categories: string[];
};

export function buildSearchIndex(methods: { id: string; data: Method }[]): SearchDoc[] {
  return methods.map(({ id, data }) => ({
    id, name: data.name, reading: data.reading, english: data.english, oneLiner: data.oneLiner,
    keywords: data.keywords, difficulty: data.difficulty,
    purposes: data.purposeCategories, dataTypes: data.dataCategories, categories: data.mathCategories,
  }));
}

export function searchMethods(docs: SearchDoc[], opts: { query: string; difficulties: string[] }): SearchDoc[] {
  const byDifficulty = (d: SearchDoc) => opts.difficulties.length === 0 || opts.difficulties.includes(d.difficulty);
  const q = opts.query.trim();
  if (!q) return docs.filter(byDifficulty);
  const fuse = new Fuse(docs, {
    keys: ['name', 'reading', 'english', 'oneLiner', 'keywords'],
    threshold: 0.4, ignoreLocation: true,
  });
  return fuse.search(q).map((r) => r.item).filter(byDifficulty);
}
