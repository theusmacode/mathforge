/** Polinômios como coeficientes do maior para o menor grau: "1 -3 2" = x² − 3x + 2. */
export type P = number[]
const NUM = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/
export function parsePoly(s: string): P {
  const t = s.split(/[\s,;]+/).filter(Boolean); if (!t.length) throw new Error('Informe os coeficientes (ex.: 1 -3 2).')
  if (t.length > 16) throw new Error('Limite: grau 15.')
  const p = t.map(x => { if (!NUM.test(x)) throw new Error(`Coeficiente inválido: “${x}” (use ponto como decimal).`); return Number(x) })
  return trim(p)
}
export const trim = (p: P): P => { let i = 0; while (i < p.length - 1 && p[i] === 0) i++; return p.slice(i) }
export const degree = (p: P) => p.length - 1
export const addP = (a: P, b: P, s = 1): P => { const n = Math.max(a.length, b.length), A = [...Array(n - a.length).fill(0), ...a], B = [...Array(n - b.length).fill(0), ...b]; return trim(A.map((x, i) => x + s * B[i])) }
export const mulP = (a: P, b: P): P => { const r: P = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y))); return trim(r) }
export function divP(a: P, b: P): { q: P; r: P } {
  if (b.every(x => x === 0)) throw new Error('Divisão por polinômio nulo.')
  if (a.length < b.length) return { q: [0], r: a }
  const r = [...a], q: P = []
  for (let i = 0; i <= a.length - b.length; i++) { const c = r[i] / b[0]; q.push(c); for (let j = 0; j < b.length; j++) r[i + j] -= c * b[j] }
  return { q: trim(q), r: trim(r.slice(a.length - b.length + 1).map(x => (Math.abs(x) < 1e-12 ? 0 : x))) }
}
export const horner = (p: P, x: number) => p.reduce((s, c) => s * x + c, 0)
export function polyStr(p: P, v = 'x'): string {
  const n = p.length - 1, f = (x: number) => String(+x.toPrecision(10)); const out: string[] = []
  p.forEach((c, i) => { if (c === 0) return; const e = n - i, a = Math.abs(c), body = e === 0 ? f(a) : `${a === 1 ? '' : f(a)}${v}${e > 1 ? `^${e}` : ''}`
    out.push(out.length ? `${c < 0 ? '- ' : '+ '}${body}` : `${c < 0 ? '-' : ''}${body}`) })
  return out.join(' ') || '0'
}
const divisors = (n: bigint): bigint[] => { const out: bigint[] = [], N = Number(n); for (let d = 1; d * d <= N; d++) if (N % d === 0) { out.push(BigInt(d)); if (d * d !== N) out.push(BigInt(N / d)) } return out }
/** Teorema das raízes racionais para coeficientes inteiros (|c| ≤ 10⁶, grau ≤ 10). Devolve raízes p/q (com multiplicidade) e o fator restante. */
export function rationalRoots(p: P) {
  if (!p.every(Number.isInteger)) throw new Error('Use coeficientes inteiros para a fatoração por raízes racionais.')
  if (p.some(c => Math.abs(c) > 1e6)) throw new Error('Limite: |coeficiente| ≤ 1 000 000.')
  if (p.length - 1 > 10) throw new Error('Limite: grau ≤ 10.')
  if (p.length < 2) throw new Error('Informe um polinômio de grau ≥ 1.')
  let a = p.map(BigInt); const roots: { p: bigint; q: bigint }[] = []
  while (a.length > 1 && a[a.length - 1] === 0n) { roots.push({ p: 0n, q: 1n }); a = a.slice(0, -1) }
  for (;;) {
    if (a.length < 2) break
    const n = a.length - 1, ps = divisors(a[n] < 0n ? -a[n] : a[n]), qs = divisors(a[0] < 0n ? -a[0] : a[0]); let found = false
    outer: for (const q of qs) for (const pp of ps) for (const sgn of [1n, -1n]) {
      const num = sgn * pp; let s = 0n; for (let i = 0; i <= n; i++) s += a[i] * num ** BigInt(n - i) * q ** BigInt(i)
      if (s !== 0n) continue
      const r: bigint[] = []; let prev = 0n; for (let i = 0; i < n; i++) { prev = (a[i] + num * prev) / q; r.push(prev) }
      roots.push({ p: num, q }); a = r; found = true; break outer
    }
    if (!found) break
  }
  return { roots, rest: a.map(Number) }
}
