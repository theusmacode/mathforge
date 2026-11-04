type Env = Record<string, boolean>
/** Operadores: ! ~ ¬ (não) · & ∧ (e) · | ∨ (ou) · ^ ⊕ (ou exclusivo) · -> → (implica) · <-> ↔ (bicondicional). Variáveis: letras. */
export function compileLogic(src: string) {
  const toks = src.replace(/<->|<=>|↔/g, '#').replace(/->|=>|→/g, '>').replace(/[~¬]/g, '!').replace(/∧/g, '&').replace(/∨/g, '|').replace(/⊕/g, '^').replace(/\s+/g, '').split('').filter(Boolean)
  if (!toks.length) throw new Error('Digite uma expressão lógica.')
  const vars = new Set<string>(); let p = 0
  type Fn = (e: Env) => boolean
  const iff = (): Fn => { let a = imp(); while (toks[p] === '#') { p++; const l = a, r = imp(); a = e => l(e) === r(e) } return a }
  const imp = (): Fn => { const a = or(); if (toks[p] === '>') { p++; const b = imp(); return e => !a(e) || b(e) } return a }
  const or = (): Fn => { let a = and(); while (toks[p] === '|' || toks[p] === '^') { const o = toks[p++], l = a, r = and(); a = o === '|' ? e => l(e) || r(e) : e => l(e) !== r(e) } return a }
  const and = (): Fn => { let a = not(); while (toks[p] === '&') { p++; const l = a, r = not(); a = e => l(e) && r(e) } return a }
  const not = (): Fn => { if (toks[p] === '!') { p++; const a = not(); return e => !a(e) } return atom() }
  const atom = (): Fn => {
    const t = toks[p++]
    if (t === '(') { const a = iff(); if (toks[p++] !== ')') throw new Error('Parêntese não fechado.'); return a }
    if (t && /[a-z]/i.test(t)) { const v = t.toLowerCase(); vars.add(v); return e => e[v] }
    throw new Error(t ? `Símbolo inesperado: “${t}”.` : 'Expressão incompleta.')
  }
  const fn = iff(); if (p < toks.length) throw new Error(`Símbolo inesperado: “${toks[p]}”.`)
  const list = [...vars].sort(); if (list.length > 6) throw new Error('Máximo de 6 variáveis.')
  return { vars: list, fn }
}
const assignments = (vars: string[]) => Array.from({ length: 2 ** vars.length }, (_, i) => Object.fromEntries(vars.map((v, j) => [v, !((i >> (vars.length - 1 - j)) & 1)])) as Env)
export function truthTable(src: string) {
  const { vars, fn } = compileLogic(src), rows = assignments(vars).map(e => ({ env: e, out: fn(e) }))
  const t = rows.filter(r => r.out).length
  return { vars, rows, kind: t === rows.length ? 'Tautologia' : t === 0 ? 'Contradição' : 'Contingência' }
}
export function equivalent(a: string, b: string) {
  const A = compileLogic(a), Bc = compileLogic(b), vars = [...new Set([...A.vars, ...Bc.vars])].sort()
  const diff = assignments(vars).find(e => A.fn(e) !== Bc.fn(e))
  return { equivalent: !diff, vars, counterexample: diff }
}
export function parseSet(s: string): string[] {
  const items = s.split(/[,;]/).map(x => x.trim()).filter(Boolean), out = [...new Set(items)]
  return out.every(x => x !== '' && !Number.isNaN(Number(x))) ? out.sort((a, b) => Number(a) - Number(b)) : out.sort()
}
export function setOps(A: string[], B: string[]) {
  const a = new Set(A), b = new Set(B)
  return { union: [...new Set([...A, ...B])], inter: A.filter(x => b.has(x)), aMinusB: A.filter(x => !b.has(x)), bMinusA: B.filter(x => !a.has(x)),
    sym: [...A.filter(x => !b.has(x)), ...B.filter(x => !a.has(x))], aSubB: A.every(x => b.has(x)), bSubA: B.every(x => a.has(x)), cartesian: A.length * B.length, powerSize: 2 ** A.length }
}
export const DIGITS = '0123456789ABCDEF'
export function parseBase(text: string, base: number): { ok: true; value: bigint } | { ok: false; error: string } {
  let s = text.trim().toUpperCase(), neg = false
  if (s.startsWith('-')) { neg = true; s = s.slice(1) }
  if (!s) return { ok: false, error: 'Digite um número.' }
  let v = 0n
  for (const c of s) { const d = DIGITS.indexOf(c); if (d < 0 || d >= base) return { ok: false, error: `“${c}” não é um dígito válido na base ${base}.` }; v = v * BigInt(base) + BigInt(d) }
  return { ok: true, value: neg ? -v : v }
}
export const toBase = (v: bigint, base: number) => v.toString(base).toUpperCase()
const mod = (x: bigint, m: bigint) => ((x % m) + m) % m
export const gcdB = (a: bigint, b: bigint): bigint => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a }
export function modPow(b: bigint, e: bigint, m: bigint) { let r = 1n % m, x = mod(b, m); while (e > 0n) { if (e & 1n) r = (r * x) % m; x = (x * x) % m; e >>= 1n } return r }
export function modInverse(a: bigint, m: bigint): bigint | null {
  let [r0, r1, s0, s1] = [mod(a, m), m, 1n, 0n]
  while (r1 !== 0n) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1] }
  return r0 === 1n ? mod(s0, m) : m === 1n ? 0n : null
}
export function progression(kind: 'pa' | 'pg', a1: number, r: number, n: number) {
  const an = kind === 'pa' ? a1 + (n - 1) * r : a1 * Math.pow(r, n - 1)
  const sn = kind === 'pa' ? (n * (a1 + an)) / 2 : r === 1 ? n * a1 : (a1 * (Math.pow(r, n) - 1)) / (r - 1)
  return { an, sn }
}
export function fibonacci(n: number): bigint { let a = 0n, b = 1n; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a }
