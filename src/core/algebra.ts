export type Quadratic =
  | { kind: 'all-reals' } | { kind: 'no-solution' }
  | { kind: 'linear'; x: number }
  | { kind: 'two-real'; delta: number; x1: number; x2: number }
  | { kind: 'one-real'; delta: number; x: number }
  | { kind: 'complex'; delta: number; re: number; im: number }

export function solveQuadratic(a: number, b: number, c: number): Quadratic {
  if (a === 0) {
    if (b === 0) return c === 0 ? { kind: 'all-reals' } : { kind: 'no-solution' }
    return { kind: 'linear', x: -c / b }
  }
  const delta = b * b - 4 * a * c
  const eps = 1e-12 * Math.max(b * b, Math.abs(4 * a * c), 1)
  if (Math.abs(delta) <= eps) return { kind: 'one-real', delta: 0, x: -b / (2 * a) }
  if (delta > 0) {
    // forma estável: evita cancelamento catastrófico
    const q = -0.5 * (b + Math.sign(b || 1) * Math.sqrt(delta))
    const r1 = q / a, r2 = c / q
    return { kind: 'two-real', delta, x1: Math.min(r1, r2), x2: Math.max(r1, r2) }
  }
  return { kind: 'complex', delta, re: -b / (2 * a) + 0, im: Math.sqrt(-delta) / (2 * Math.abs(a)) }
}

export type Linear = { kind: 'unique'; x: number } | { kind: 'none' } | { kind: 'all' }
/** Resolve a·x + b = c. */
export function solveLinear(a: number, b: number, c: number): Linear {
  if (a === 0) return b === c ? { kind: 'all' } : { kind: 'none' }
  return { kind: 'unique', x: (c - b) / a }
}
