/** Formata para exibição apenas; cálculos internos nunca são arredondados. */
export function fmt(n: number, digits = 6): string {
  if (!Number.isFinite(n)) return '—'
  if (Object.is(n, -0)) n = 0
  return n.toLocaleString('pt-BR', { maximumFractionDigits: digits })
}
