// src/lib/chart-stats.ts
// 図と表の数値を一致させるための純粋な統計・幾何ヘルパー。React/DOM 非依存。
// すべての値は描画側（Recharts / 模式図）と本ファイルのテストで共有する。

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// 分散。既定は母分散（n で割る）。opts.sample で不偏分散（n-1）。
export function variance(xs: number[], opts: { sample?: boolean } = {}): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  const denom = opts.sample ? Math.max(1, xs.length - 1) : xs.length;
  return xs.reduce((a, b) => a + (b - m) ** 2, 0) / denom;
}

// 標準偏差。既定は母標準偏差。
export function stdev(xs: number[], opts: { sample?: boolean } = {}): number {
  return Math.sqrt(variance(xs, opts));
}

// 線形補間による分位点（numpy 既定 = type 7 と一致）。
export function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const frac = pos - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export type FiveNumber = {
  min: number; q1: number; median: number; q3: number; max: number; iqr: number;
};

// 5 数要約（箱ひげ図用）。
export function quartiles(xs: number[]): FiveNumber {
  const sorted = [...xs].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  return {
    min: sorted[0] ?? 0,
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1] ?? 0,
    iqr: q3 - q1,
  };
}

export type LinearFit = { slope: number; intercept: number; r2: number };

// 最小二乗の単回帰直線（傾き・切片・決定係数）。
export function linearFit(points: [number, number][]): LinearFit {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.[1] ?? 0, r2: 0 };
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = sxx === 0 || syy === 0 ? 0 : (sxy * sxy) / (sxx * syy);
  return { slope, intercept, r2 };
}

// ピアソンの相関係数。
export function correlation(points: [number, number][]): number {
  const { r2, slope } = linearFit(points);
  const r = Math.sqrt(Math.max(0, r2));
  return slope < 0 ? -r : r;
}

// ロジスティック関数 1/(1+e^-(b0+b1 x))。
export function logistic(x: number, b0: number, b1: number): number {
  return 1 / (1 + Math.exp(-(b0 + b1 * x)));
}

// 指定 x 範囲をなめらかに刻んだロジスティック曲線の点列。
export function logisticCurve(
  b0: number, b1: number, lo: number, hi: number, steps = 48,
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const x = lo + ((hi - lo) * i) / steps;
    out.push([x, logistic(x, b0, b1)]);
  }
  return out;
}

// p=0.5 となる x（決定境界） = -b0/b1。
export function logisticBoundary(b0: number, b1: number): number {
  return b1 === 0 ? 0 : -b0 / b1;
}

function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range || 1));
  const frac = (range || 1) / 10 ** exp;
  let niceFrac: number;
  if (round) {
    if (frac < 1.5) niceFrac = 1;
    else if (frac < 3) niceFrac = 2;
    else if (frac < 7) niceFrac = 5;
    else niceFrac = 10;
  } else {
    if (frac <= 1) niceFrac = 1;
    else if (frac <= 2) niceFrac = 2;
    else if (frac <= 5) niceFrac = 5;
    else niceFrac = 10;
  }
  return niceFrac * 10 ** exp;
}

// 軸の「きりのいい」目盛り値を生成する。
export function niceTicks(lo: number, hi: number, count = 5): number[] {
  if (lo === hi) { lo -= 1; hi += 1; }
  if (lo > hi) [lo, hi] = [hi, lo];
  const step = niceNum((hi - lo) / Math.max(1, count - 1), true);
  const niceLo = Math.floor(lo / step) * step;
  const niceHi = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = niceLo; v <= niceHi + step * 0.5; v += step) {
    // 浮動小数の誤差を丸める。
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return ticks;
}

// 2 ベクトルのコサイン類似度。
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// 2 ベクトルのなす角（度）。
export function cosineAngleDeg(a: number[], b: number[]): number {
  const c = Math.max(-1, Math.min(1, cosineSimilarity(a, b)));
  return (Math.acos(c) * 180) / Math.PI;
}
