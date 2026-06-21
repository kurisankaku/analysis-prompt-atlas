// tests/content.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { methodSchema } from '../src/content/schema';

const DIR = join(process.cwd(), 'src/content/methods');

function loadAll() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));
  return files.map((f) => ({
    id: f.replace(/\.yaml$/, ''),
    data: parse(readFileSync(join(DIR, f), 'utf-8')),
  }));
}

describe('method content', () => {
  const entries = loadAll();

  it('少なくとも2件の手法がある', () => {
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('すべての手法がスキーマに適合する', () => {
    for (const e of entries) {
      expect(() => methodSchema.parse(e.data), `${e.id} が不適合`).not.toThrow();
    }
  });

  it('すべての手法に図（sampleChart）がある', () => {
    for (const e of entries) {
      expect(e.data.sampleChart, `${e.id} に図がない`).toBeTruthy();
      expect(typeof e.data.sampleChart.type, `${e.id} の図に type がない`).toBe('string');
    }
  });

  it('related[].id がすべて実在する（参照整合）', () => {
    const ids = new Set(entries.map((e) => e.id));
    for (const e of entries) {
      for (const rel of e.data.related ?? []) {
        expect(ids.has(rel.id), `${e.id} -> ${rel.id} が未定義`).toBe(true);
      }
    }
  });
});
