export type Calc = { ok: true; value: number } | { ok: false; error: string }
const bad = (error: string): Calc => ({ ok: false, error })
/** Variação em % de a para b, relativa a |a|. */
export const pctChange = (a: number, b: number): Calc => (a === 0 ? bad('O valor inicial não pode ser zero.') : { ok: true, value: ((b - a) / Math.abs(a)) * 100 })
/** mode: 'discount' | 'increase'. */
export function applyPct(v: number, p: number, mode: 'discount' | 'increase'): Calc {
  if (p < 0) return bad('Informe a porcentagem como valor não negativo.')
  if (mode === 'discount' && p > 100) return bad('Um desconto não pode passar de 100%.')
  return { ok: true, value: v * (1 + (mode === 'discount' ? -p : p) / 100) }
}
/** Valor antes do desconto/acréscimo, dado o valor final. */
export function originalValue(final: number, p: number, mode: 'discount' | 'increase'): Calc {
  if (p < 0) return bad('Informe a porcentagem como valor não negativo.')
  if (mode === 'discount' && p >= 100) return bad('Com desconto de 100% ou mais o valor original é indeterminado.')
  return { ok: true, value: final / (1 + (mode === 'discount' ? -p : p) / 100) }
}
export function marginMarkup(cost: number, price: number) {
  if (cost < 0 || price < 0) return { ok: false as const, error: 'Custo e preço não podem ser negativos.' }
  if (cost === 0) return { ok: false as const, error: 'O custo não pode ser zero (markup indefinido).' }
  if (price === 0) return { ok: false as const, error: 'O preço de venda não pode ser zero (margem indefinida).' }
  const profit = price - cost
  return { ok: true as const, profit, margin: (profit / price) * 100, markup: (profit / cost) * 100 }
}
