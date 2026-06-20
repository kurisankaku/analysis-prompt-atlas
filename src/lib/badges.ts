// src/lib/badges.ts
// 難易度バッジの配色を一元管理する。mockup の .diff-* と同じ淡色トーン。
// （tailwind theme トークンに無いパステル色は、mockup と一致させるためここだけ小さな hex 直書きを許容する。）
import type { Method } from '../content/schema';

const DIFFICULTY_BADGE_CLASS: Record<Method['difficulty'], string> = {
  基礎: 'bg-[#E3F0E9] text-[#235D43]',
  初級: 'bg-[#E6EEF4] text-[#2C5876]',
  中級: 'bg-[#F4ECDA] text-[#8A6516]',
  上級: 'bg-[#F4E2E9] text-[#8E2B53]',
  高度: 'bg-[#ECE4F2] text-[#5B3A86]',
};

// 難易度に対応するバッジの背景・文字色クラスを返す。
export function difficultyBadgeClass(difficulty: Method['difficulty']): string {
  return DIFFICULTY_BADGE_CLASS[difficulty];
}
