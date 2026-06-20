// src/components/SearchApp.tsx
// 検索の React アイランド。query / difficulties を保持し、検索ロジックは
// search.ts の searchMethods に委譲する（ここに検索を再実装しない）。
// 結果カードは MethodCard と同じ @theme トークンで JSX として描く。
import { useId, useMemo, useState } from 'react';
import { searchMethods, type SearchDoc } from '../lib/search';
import { difficultyBadgeClass } from '../lib/badges';
import { DIFFICULTIES } from '../content/schema';

interface Props {
  docs: SearchDoc[];
}

export default function SearchApp({ docs }: Props) {
  const [query, setQuery] = useState('');
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const inputId = useId();

  const results = useMemo(
    () => searchMethods(docs, { query, difficulties }),
    [docs, query, difficulties],
  );

  const toggleDifficulty = (d: string) =>
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  return (
    <div className="flex flex-col gap-5 pt-5 pb-[60px]">
      {/* ---------- 検索入力 ---------- */}
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="font-mono text-[0.78rem] tracking-[0.05em] text-signal">
          手法を探す
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="手法名・キーワードで探す（例：相関）"
          className="w-full rounded border border-line bg-card px-4 py-3 text-ink placeholder:text-ink-faint focus:border-ink-soft focus:outline-none focus:ring-1 focus:ring-ink-soft"
        />
      </div>

      {/* ---------- 難易度ピル ---------- */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="難易度で絞り込む">
        {DIFFICULTIES.map((d) => {
          const active = difficulties.includes(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              onClick={() => toggleDifficulty(d)}
              className={`rounded-full px-3 py-1 text-[0.8rem] font-semibold transition-colors ${
                active
                  ? 'border border-ink bg-ink text-paper'
                  : 'border border-line text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* ---------- 件数 ---------- */}
      <p className="font-mono text-[0.8rem] text-ink-faint" aria-live="polite">
        {results.length} 件
      </p>

      {/* ---------- 結果リスト／空状態 ---------- */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {results.map((doc) => (
            <a
              key={doc.id}
              href={`/methods/${doc.id}`}
              className="flex flex-col gap-2.5 rounded border border-line bg-card p-5 text-inherit no-underline transition-[border-color,box-shadow] duration-150 hover:border-ink hover:shadow-[0_1px_2px_rgba(22,48,46,.06),0_8px_24px_rgba(22,48,46,.06)]"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div>
                  <h3 className="font-display text-[1.18rem] font-bold">{doc.name}</h3>
                  <span className="font-mono text-xs text-ink-faint">
                    {doc.reading} ・ {doc.english}
                  </span>
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${difficultyBadgeClass(doc.difficulty)}`}
                >
                  {doc.difficulty}
                </span>
              </div>
              <p className="text-[0.9rem] leading-[1.65] text-ink-soft">{doc.oneLiner}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-ink-soft">該当する手法は見つかりませんでした。条件を変えてお試しください。</p>
      )}
    </div>
  );
}
