import { gcd } from './number-theory.ts'
export interface Frac { n: number; d: number }
const safe = (x: number) => { if (!Number.isSafeInteger(x)) throw new RangeError('Resultado grande demais para cálculo exato.'); return x }
/** Normaliza: denominador > 0 e fração irredutível. Lança erro se d = 0 ou valores não inteiros. */
export function frac(n: number, d: number): Frac {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new RangeError('Numerador e denominador devem ser inteiros.')
  if (d === 0) throw new RangeError('O denominador não pode ser zero.')
  const g = gcd(n, d) || 1, s = d < 0 ? -1 : 1
  return { n: safe((s * n) / g) + 0, d: safe((s * d) / g) }
}
export const add = (a: Frac, b: Frac) => frac(safe(a.n * b.d + b.n * a.d), safe(a.d * b.d))
export const sub = (a: Frac, b: Frac) => frac(safe(a.n * b.d - b.n * a.d), safe(a.d * b.d))
export const mul = (a: Frac, b: Frac) => frac(safe(a.n * b.n), safe(a.d * b.d))
export const div = (a: Frac, b: Frac) => { if (b.n === 0) throw new RangeError('Divisão por fração nula (zero).'); return frac(safe(a.n * b.d), safe(a.d * b.n)) }
export const toText = (f: Frac) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`)
