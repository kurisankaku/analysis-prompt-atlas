// src/lib/methods.ts
// `getCollection('methods')` の薄いラッパ。各エントリを { id, data } に正規化して返す。
import { getCollection } from 'astro:content';
import type { Method } from '../content/schema';

export async function allMethods(): Promise<{ id: string; data: Method }[]> {
  const entries = await getCollection('methods');
  return entries.map((e) => ({ id: e.id, data: e.data }));
}
