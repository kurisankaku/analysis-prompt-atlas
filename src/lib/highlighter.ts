// src/lib/highlighter.ts
// Shiki のハイライターをシングルトンで保持する（ビルド時に何度も再生成しない）。
// 出力は静的HTML（インライン色）なのでクライアントには Shiki 本体を出さない。
import { createHighlighter, type Highlighter } from 'shiki';

let promise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!promise) {
    promise = createHighlighter({
      themes: ['github-light'],
      langs: ['python', 'javascript'],
    });
  }
  return promise;
}
