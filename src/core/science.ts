export const pos = (...v: (number | undefined)[]) => v.every(x => x !== undefined && Number.isFinite(x) && x > 0)
export const circle = (r: number) => ({ d: 2 * r, c: 2 * Math.PI * r, a: Math.PI * r * r })
export const sphere = (r: number) => ({ v: (4 / 3) * Math.PI * r ** 3, a: 4 * Math.PI * r * r })
export const cylinder = (r: number, h: number) => ({ v: Math.PI * r * r * h, lat: 2 * Math.PI * r * h, tot: 2 * Math.PI * r * (r + h) })
export const cone = (r: number, h: number) => { const g = Math.hypot(r, h); return { g, v: (Math.PI * r * r * h) / 3, lat: Math.PI * r * g, tot: Math.PI * r * (r + g) } }
export const cube = (a: number) => ({ v: a ** 3, a: 6 * a * a, d: a * Math.sqrt(3) })
export const regularPolygon = (n: number, l: number) => {
  const ap = l / (2 * Math.tan(Math.PI / n)), p = n * l
  return { perimeter: p, apothem: ap, area: (p * ap) / 2, angleSum: (n - 2) * 180, interior: ((n - 2) * 180) / n, diagonals: (n * (n - 3)) / 2 }
}
export const trigRatios = (rad: number) => {
  const snap = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x), c = Math.cos(rad)
  return { sin: snap(Math.sin(rad)), cos: snap(c), tan: Math.abs(c) < 1e-12 ? null : snap(Math.tan(rad)) }
}
/** n! / (n−k)! e n! / (k!(n−k)!) exatos com BigInt. Limite n ≤ 200. */
export function combinatorics(n: number, k: number) {
  if (![n, k].every(Number.isInteger) || n < 0 || k < 0) return { ok: false as const, error: 'n e k devem ser inteiros não negativos.' }
  if (k > n) return { ok: false as const, error: 'É necessário k ≤ n.' }
  if (n > 200) return { ok: false as const, error: 'Limite: n ≤ 200.' }
  const f = (m: number) => { let r = 1n; for (let i = 2n; i <= BigInt(m); i++) r *= i; return r }
  const fn = f(n), fnk = f(n - k)
  return { ok: true as const, permutation: fn, arrangement: fn / fnk, combination: fn / (f(k) * fnk) }
}
