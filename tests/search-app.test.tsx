// tests/search-app.test.tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchApp from '../src/components/SearchApp';
import { buildSearchIndex } from '../src/lib/search';
import { sampleMethod } from './fixtures/sample-method';

const docs = buildSearchIndex([
  { id: 'mean', data: sampleMethod },
  {
    id: 'median',
    data: {
      ...sampleMethod,
      name: '中央値',
      reading: 'ちゅうおうち',
      english: 'Median',
      oneLiner: '真ん中の値',
      keywords: ['median'],
      difficulty: '初級',
    } as any,
  },
]);

describe('SearchApp', () => {
  it('初期表示で全件、入力で絞り込む', () => {
    render(<SearchApp docs={docs} />);
    expect(screen.getByText('平均')).toBeTruthy();
    expect(screen.getByText('中央値')).toBeTruthy();
    const input = screen.getByPlaceholderText(/手法名・キーワード/);
    fireEvent.change(input, { target: { value: 'へいきん' } });
    expect(screen.getByText('平均')).toBeTruthy();
    expect(screen.queryByText('中央値')).toBeNull();
  });

  it('難易度ピルで絞り込む', () => {
    render(<SearchApp docs={docs} />);
    // 初級ピルをトグル → 中央値（初級）だけが残る
    fireEvent.click(screen.getByRole('button', { name: '初級' }));
    expect(screen.getByText('中央値')).toBeTruthy();
    expect(screen.queryByText('平均')).toBeNull();
  });

  it('該当なしで空状態を表示', () => {
    render(<SearchApp docs={docs} />);
    const input = screen.getByPlaceholderText(/手法名・キーワード/);
    fireEvent.change(input, { target: { value: 'xyzzy該当しない' } });
    expect(screen.queryByText('平均')).toBeNull();
    expect(screen.queryByText('中央値')).toBeNull();
    expect(screen.getByText(/見つかりません|該当/)).toBeTruthy();
  });
});
