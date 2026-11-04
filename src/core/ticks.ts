/** Marcas "agradáveis" (1, 2, 5 × 10ⁿ) cobrindo [a, b], com ~6 divisões. */
export function niceTicks(a: number, b: number): number[] {
  if (!(b > a)) return [a]
  const raw = (b - a) / 6, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p, s = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, out: number[] = []
  for (let t = Math.ceil(a / s - 1e-9) * s; t <= b + s * 1e-9; t += s) out.push(Math.abs(t) < s * 1e-9 ? 0 : +t.toPrecision(12))
  return out
}
