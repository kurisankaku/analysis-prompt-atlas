// tests/fixtures/sample-method.ts
export const sampleMethod = {
  name: '平均',
  reading: 'へいきん',
  english: 'Mean',
  summary: '数値をすべて足して個数で割った代表値。',
  oneLiner: 'データ全体をならすと1個あたりどれくらいかを表す値。',
  analogy: 'クラス全員の点を合計して人数で割ると平均点が出る。',
  whatYouLearn: 'データ全体の中心的な水準が分かる。',
  suitableData: ['数値データ（売上、点数、金額など）'],
  suitablePurposes: ['全体の代表値を知りたい'],
  inputData: '1列の数値が並んだデータ。1行が1件に対応する。',
  sampleTable: {
    caption: '例：5人の点数',
    columns: ['生徒', '点数'],
    rows: [
      ['Aさん', '60'],
      ['Bさん', '70'],
    ],
  },
  sampleChart: {
    type: 'vectors',
    caption: 'テスト用の模式図',
    vectors: [
      { label: 'A', x: 3, y: 1 },
      { label: 'B', x: 2, y: 2 },
    ],
  },
  results: 'データ全体を代表する1つの数値。',
  howToRead: '平均80点なら全体の中心は約80点。全員が80点という意味ではない。',
  beforeAfter: {
    before: '点数がバラバラで全体水準がつかめない。',
    after: '全体の中心は約80点と一言で言える。',
  },
  whenToUse: ['全体のおおまかな水準を一言で示したいとき'],
  whenNotToUse: ['外れ値が混じるとき'],
  cautions: ['外れ値に弱い。1つの極端な値で大きく動く。'],
  related: [
    { id: 'median', type: '比較対象', note: '外れ値に強い代表値。' },
  ],
  aiPromptExample:
    'このデータの平均を出し、全体の水準を一言で説明してください。',
  keyResults: [{ label: '平均', value: '80', unit: '点', hint: '合計400 ÷ 5人' }],
  codeExample: {
    lang: 'python',
    note: 'statistics を使用',
    code: 'import statistics\nscores = [60, 70, 80, 90, 100]  # 例データ\nprint(statistics.mean(scores))  # 80',
  },
  derivation: {
    intro: 'テスト用の計算手順。',
    symbols: [{ sym: 'n', meaning: 'データの個数' }],
    steps: [
      {
        formula: '\\bar{x} = \\dfrac{1}{n}\\sum_{i=1}^{n} x_i',
        explain: 'すべての値を足して個数で割る。',
        example: '\\bar{x} = \\dfrac{400}{5} = 80',
        result: '平均は80点',
      },
    ],
  },
  difficulty: '基礎',
  tags: ['基礎統計', '解釈しやすい'],
  keywords: ['平均', 'mean', 'average', '代表値'],
  purposeCategories: ['傾向を知りたい', '要約したい'],
  dataCategories: ['数値データ'],
  mathCategories: ['基礎統計'],
  formula: '平均 = (x₁ + … + xₙ) / n',
};
