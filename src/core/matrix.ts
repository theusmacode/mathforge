export type M = number[][]
const EPS = 1e-10
const NUM = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/
/** Linhas separadas por ; ou quebra de linha; colunas por espaço ou vírgula; decimal com ponto. Máx. 8×8. */
export function parseMatrix(s: string, max = 8): M {
  const rows = s.split(/;|\n/).map(r => r.trim()).filter(Boolean)
  if (!rows.length) throw new Error('Informe a matriz (ex.: 1 2; 3 4).')
  const m = rows.map(r => r.split(/[\s,]+/).filter(Boolean).map(x => { if (!NUM.test(x)) throw new Error(`Valor inválido na matriz: “${x}” (use ponto como decimal).`); return Number(x) }))
  if (m.some(r => r.length !== m[0].length)) throw new Error('Todas as linhas devem ter o mesmo número de colunas.')
  if (m.length > max || m[0].length > max) throw new Error(`Limite: ${max}×${max}.`)
  return m
}
export const dims = (a: M) => `${a.length}×${a[0].length}`
const same = (a: M, b: M) => { if (a.length !== b.length || a[0].length !== b[0].length) throw new Error(`Dimensões incompatíveis: ${dims(a)} e ${dims(b)}.`) }
export const add = (a: M, b: M, sign = 1): M => { same(a, b); return a.map((r, i) => r.map((x, j) => x + sign * b[i][j])) }
export const scale = (a: M, k: number): M => a.map(r => r.map(x => x * k))
export const transpose = (a: M): M => a[0].map((_, j) => a.map(r => r[j]))
export function mul(a: M, b: M): M {
  if (a[0].length !== b.length) throw new Error(`Produto indefinido: ${dims(a)} · ${dims(b)} (colunas de A ≠ linhas de B).`)
  return a.map(r => b[0].map((_, j) => r.reduce((s, x, k) => s + x * b[k][j], 0)))
}
const square = (a: M) => { if (a.length !== a[0].length) throw new Error(`A matriz deve ser quadrada (é ${dims(a)}).`) }
export function det(a: M): number {
  square(a); const n = a.length, m = a.map(r => [...r]); let d = 1
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r
    if (Math.abs(m[p][c]) < EPS) return 0
    if (p !== c) { [m[p], m[c]] = [m[c], m[p]]; d = -d }
    d *= m[c][c]
    for (let r = c + 1; r < n; r++) { const f = m[r][c] / m[c][c]; for (let k = c; k < n; k++) m[r][k] -= f * m[c][k] }
  }
  return d
}
/** Gauss-Jordan com pivotamento parcial. Retorna a forma escalonada reduzida, o posto e as colunas-pivô. */
export function rref(a: M) {
  const m = a.map(r => [...r]), rows = m.length, cols = m[0].length, pivots: number[] = []; let r = 0
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r; for (let i = r + 1; i < rows; i++) if (Math.abs(m[i][c]) > Math.abs(m[p][c])) p = i
    if (Math.abs(m[p][c]) < EPS) continue
    [m[p], m[r]] = [m[r], m[p]]
    const d = m[r][c]; m[r] = m[r].map(x => x / d)
    for (let i = 0; i < rows; i++) if (i !== r) { const f = m[i][c]; if (f !== 0) m[i] = m[i].map((x, k) => x - f * m[r][k]) }
    pivots.push(c); r++
  }
  return { m: m.map(row => row.map(x => (Math.abs(x) < EPS ? 0 : x))), rank: pivots.length, pivots }
}
export function inverse(a: M): M | null {
  square(a); const n = a.length, aug = a.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))])
  const { m, pivots } = rref(aug)
  return pivots.length === n && pivots.slice(0, n).every((p, i) => p === i) ? m.map(r => r.slice(n)) : null
}
export type Sys = { kind: 'unique'; x: number[] } | { kind: 'none' } | { kind: 'infinite'; rank: number; free: number[]; lines: string[] }
/** Matriz aumentada [A | b] com n equações e m incógnitas (m+1 colunas). */
export function solveSystem(aug: M): Sys {
  const unk = aug[0].length - 1; if (unk < 1) throw new Error('A matriz aumentada precisa de ao menos 2 colunas.')
  const { m, rank, pivots } = rref(aug)
  if (pivots.includes(unk)) return { kind: 'none' }
  if (rank === unk) return { kind: 'unique', x: pivots.map((_, i) => m[i][unk] + 0) }
  const free = Array.from({ length: unk }, (_, j) => j).filter(j => !pivots.includes(j)), v = (x: number) => String(+x.toPrecision(10))
  const lines = pivots.map((p, i) => `x${p + 1} = ${v(m[i][unk])}${free.map(f => (m[i][f] === 0 ? '' : ` ${m[i][f] > 0 ? '−' : '+'} ${v(Math.abs(m[i][f]))}·x${f + 1}`)).join('')}`)
  return { kind: 'infinite', rank, free, lines: [...lines, `Variáveis livres: ${free.map(f => `x${f + 1}`).join(', ')}`] }
}
