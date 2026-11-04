export type Parsed = { ok: true; values: number[] } | { ok: false; error: string }
const NUM = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?$/
/** Separadores: espaço, quebra de linha ou ponto e vírgula. A vírgula é aceita como decimal (1,5). */
export function parseData(text: string): Parsed {
  const toks = text.split(/;|\n|\s+/).map(t => t.replace(/^,+|,+$/g, '')).filter(Boolean)
  if (!toks.length) return { ok: false, error: 'Informe ao menos um valor.' }
  if (toks.length > 10000) return { ok: false, error: 'Limite: 10 000 valores.' }
  const values: number[] = []
  for (const t of toks) {
    if (!NUM.test(t)) return { ok: false, error: `Valor inválido: “${t}”. Separe por espaço, quebra de linha ou ponto e vírgula; use vírgula só como decimal.` }
    values.push(Number(t.replace(',', '.')))
  }
  return { ok: true, values }
}
/** Percentil por interpolação linear (equivale a Excel PERCENTIL.INC / R tipo 7). */
export function percentile(sorted: number[], p: number): number {
  const h = ((sorted.length - 1) * p) / 100, lo = Math.floor(h), hi = Math.ceil(h)
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo])
}
export function describe(values: number[]) {
  const n = values.length, sorted = [...values].sort((a, b) => a - b), mean = values.reduce((s, x) => s + x, 0) / n
  const ss = values.reduce((s, x) => s + (x - mean) ** 2, 0) // duas passagens: estável
  const counts = new Map<number, number>(); for (const x of values) counts.set(x, (counts.get(x) ?? 0) + 1)
  const maxF = Math.max(...counts.values()), modes = n > 1 && maxF === 1 ? [] : [...counts].filter(([, c]) => c === maxF).map(([x]) => x).sort((a, b) => a - b)
  const q1 = percentile(sorted, 25), q2 = percentile(sorted, 50), q3 = percentile(sorted, 75), iqr = q3 - q1
  return { n, sorted, mean, median: q2, modes, min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0],
    varPop: ss / n, sdPop: Math.sqrt(ss / n), varSample: n > 1 ? ss / (n - 1) : null, sdSample: n > 1 ? Math.sqrt(ss / (n - 1)) : null,
    q1, q2, q3, iqr, outliers: sorted.filter(x => x < q1 - 1.5 * iqr || x > q3 + 1.5 * iqr) }
}
/** ≤ 20 valores distintos: tabela por valor. Senão, classes de mesma largura (regra de Sturges), última classe fechada. */
export function frequencies(sorted: number[]): { label: string; count: number }[] {
  const distinct = [...new Set(sorted)]
  if (distinct.length <= 20) return distinct.map(v => ({ label: String(v), count: sorted.filter(x => x === v).length }))
  const k = Math.ceil(1 + Math.log2(sorted.length)), min = sorted[0], w = (sorted[sorted.length - 1] - min) / k
  const bins = Array.from({ length: k }, (_, i) => ({ label: `[${+(min + i * w).toPrecision(6)}, ${+(min + (i + 1) * w).toPrecision(6)}${i === k - 1 ? ']' : ')'}`, count: 0 }))
  for (const x of sorted) bins[Math.min(k - 1, Math.floor((x - min) / w))].count++
  return bins
}
