/** Motor de Cálculo: AST seguro (sem eval), derivada simbólica, integral simbólica (subconjunto) e métodos numéricos. Ângulos em radianos. */
export type Node =
  | { k: 'num'; v: number; s?: string } | { k: 'var' } | { k: 'neg'; a: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node } | { k: 'fn'; name: string; a: Node }
const FN = ['sin', 'cos', 'tan', 'exp', 'ln', 'sqrt', 'abs']
const N = (v: number): Node => ({ k: 'num', v })
const B = (op: '+' | '-' | '*' | '/' | '^', a: Node, b: Node): Node => ({ k: 'bin', op, a, b })
const F = (name: string, a: Node): Node => ({ k: 'fn', name, a })
const X: Node = { k: 'var' }

export function parse(src: string): Node {
  if (!src.trim()) throw new Error('Digite uma expressão em x.')
  if (src.length > 200) throw new Error('Expressão longa demais (máximo 200 caracteres).')
  const toks = src.toLowerCase().match(/\d+([.,]\d*)?|[.,]\d+|[a-z_]\w*|[-+*/^()]|\S/g) as string[]
  let p = 0
  const eat = (t: string) => { if (toks[p] !== t) throw new Error(`Esperado “${t}”.`); p++ }
  const expr = (): Node => { let a = term(); while (toks[p] === '+' || toks[p] === '-') { const op = toks[p++] as '+' | '-'; a = B(op, a, term()) } return a }
  const term = (): Node => { let a = unary(); while (toks[p] === '*' || toks[p] === '/') { const op = toks[p++] as '*' | '/'; a = B(op, a, unary()) } return a }
  const unary = (): Node => { if (toks[p] === '-') { p++; return { k: 'neg', a: unary() } } if (toks[p] === '+') { p++; return unary() } return power() }
  const power = (): Node => { const b = primary(); if (toks[p] === '^') { p++; return B('^', b, unary()) } return b }
  const primary = (): Node => {
    const t = toks[p++]
    if (t === undefined) throw new Error('Expressão incompleta.')
    if (/^[\d.,]/.test(t)) return N(Number(t.replace(',', '.')))
    if (t === '(') { const a = expr(); eat(')'); return a }
    if (t === 'x') return X
    if (t === 'pi') return { k: 'num', v: Math.PI, s: 'π' }
    if (t === 'e') return { k: 'num', v: Math.E, s: 'e' }
    if (FN.includes(t)) { eat('('); const a = expr(); eat(')'); return F(t, a) }
    throw new Error(`Símbolo não reconhecido: “${t}”. Use x, pi, e, + − * / ^ e sin, cos, tan, exp, ln, sqrt, abs. Escreva 2*x, não 2x.`)
  }
  const n = expr(); if (p < toks.length) throw new Error(`Símbolo inesperado: “${toks[p]}”.`)
  return n
}
export function evalNode(n: Node, x: number): number {
  switch (n.k) {
    case 'num': return n.v
    case 'var': return x
    case 'neg': return -evalNode(n.a, x)
    case 'bin': { const a = evalNode(n.a, x), b = evalNode(n.b, x)
      switch (n.op) { case '+': return a + b; case '-': return a - b; case '*': return a * b; case '/': return b === 0 ? NaN : a / b; default: return Math.pow(a, b) } }
    case 'fn': { const a = evalNode(n.a, x)
      switch (n.name) { case 'sin': return Math.sin(a); case 'cos': return Math.cos(a); case 'tan': return Math.abs(Math.cos(a)) < 1e-12 ? NaN : Math.tan(a)
        case 'exp': return Math.exp(a); case 'ln': return a > 0 ? Math.log(a) : NaN; case 'sqrt': return a >= 0 ? Math.sqrt(a) : NaN; default: return Math.abs(a) } }
  }
}
export const hasVar = (n: Node): boolean => (n.k === 'var' ? true : n.k === 'num' ? false : n.k === 'bin' ? hasVar(n.a) || hasVar(n.b) : hasVar(n.a))

export function simp(n: Node): Node {
  if (n.k === 'neg') { const a = simp(n.a); return a.k === 'num' && !a.s ? N(-a.v) : a.k === 'neg' ? a.a : { k: 'neg', a } }
  if (n.k === 'fn') return F(n.name, simp(n.a))
  if (n.k !== 'bin') return n
  const a = simp(n.a), b = simp(n.b), is = (q: Node, v: number) => q.k === 'num' && !q.s && q.v === v
  if (a.k === 'num' && b.k === 'num' && !a.s && !b.s) { const r = evalNode(B(n.op, a, b), 0); if (Number.isFinite(r)) return N(r) }
  switch (n.op) {
    case '+': if (is(a, 0)) return b; if (is(b, 0)) return a; break
    case '-': if (is(b, 0)) return a; if (is(a, 0)) return simp({ k: 'neg', a: b }); break
    case '*': if (is(a, 0) || is(b, 0)) return N(0); if (is(a, 1)) return b; if (is(b, 1)) return a; if (is(a, -1)) return simp({ k: 'neg', a: b }); break
    case '/': if (is(a, 0)) return N(0); if (is(b, 1)) return a; break
    case '^': if (is(b, 0)) return N(1); if (is(b, 1)) return a; break
  }
  return B(n.op, a, b)
}
function d(n: Node): Node {
  switch (n.k) {
    case 'num': return N(0)
    case 'var': return N(1)
    case 'neg': return { k: 'neg', a: d(n.a) }
    case 'bin': { const { a, b } = n
      switch (n.op) {
        case '+': case '-': return B(n.op, d(a), d(b))
        case '*': return B('+', B('*', d(a), b), B('*', a, d(b)))
        case '/': return B('/', B('-', B('*', d(a), b), B('*', a, d(b))), B('^', b, N(2)))
        default:
          if (!hasVar(b)) return B('*', B('*', b, B('^', a, B('-', b, N(1)))), d(a))
          if (!hasVar(a)) return B('*', B('*', n, F('ln', a)), d(b))
          return B('*', n, B('+', B('*', d(b), F('ln', a)), B('/', B('*', b, d(a)), a)))
      } }
    case 'fn': { const u = n.a, du = d(u)
      switch (n.name) {
        case 'sin': return B('*', F('cos', u), du)
        case 'cos': return { k: 'neg', a: B('*', F('sin', u), du) }
        case 'tan': return B('/', du, B('^', F('cos', u), N(2)))
        case 'exp': return B('*', n, du)
        case 'ln': return B('/', du, u)
        case 'sqrt': return B('/', du, B('*', N(2), n))
        default: return B('*', B('/', u, n), du)
      } }
  }
}
export const deriv = (n: Node) => simp(d(n))
export const derivN = (n: Node, order: number) => { let r = n; for (let i = 0; i < order; i++) r = deriv(r); return r }
export function rulesOf(n: Node): string[] {
  const r = new Set<string>()
  const w = (m: Node) => {
    if (m.k === 'bin') { if (m.op === '+' || m.op === '-') r.add('regra da soma/diferença'); if (m.op === '*' && hasVar(m.a) && hasVar(m.b)) r.add('regra do produto')
      if (m.op === '/' && hasVar(m.b)) r.add('regra do quociente'); if (m.op === '^') r.add(hasVar(m.b) ? 'derivada de u^v (logarítmica)' : 'regra da potência'); w(m.a); w(m.b) }
    else if (m.k === 'neg') w(m.a)
    else if (m.k === 'fn') { r.add(`derivada de ${m.name}`); if (m.a.k !== 'var') r.add('regra da cadeia'); w(m.a) }
  }
  w(n); return [...r]
}
const P = (n: Node): number => (n.k === 'bin' ? { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 }[n.op] : n.k === 'neg' ? 3 : 5)
export function str(n: Node, min = 0): string {
  let s: string
  switch (n.k) {
    case 'num': s = n.s ?? String(+n.v.toPrecision(12)); break
    case 'var': s = 'x'; break
    case 'neg': s = '-' + str(n.a, 3); break
    case 'fn': s = `${n.name}(${str(n.a)})`; break
    case 'bin': s = n.op === '+' ? `${str(n.a, 1)} + ${str(n.b, 1)}` : n.op === '-' ? `${str(n.a, 1)} - ${str(n.b, 2)}`
      : n.op === '*' ? `${str(n.a, 2)} * ${str(n.b, 2)}` : n.op === '/' ? `${str(n.a, 2)} / ${str(n.b, 3)}` : `${str(n.a, 5)}^${str(n.b, 4)}`
  }
  return P(n) < min ? `(${s})` : s
}
export class Unsupported extends Error {}
/** Antiderivada (sem a constante C) para: constantes, polinômios x^n, 1/x, sin x, cos x, e^x e combinações lineares. */
export function integ(n: Node): Node {
  const bad = () => new Unsupported('Integral fora do subconjunto suportado (x^n, 1/x, sin(x), cos(x), exp(x) e combinações lineares; use x^2, não x*x).')
  if (!hasVar(n)) return B('*', n, X)
  switch (n.k) {
    case 'var': return B('/', B('^', X, N(2)), N(2))
    case 'neg': return { k: 'neg', a: integ(n.a) }
    case 'fn': if (n.a.k === 'var') { if (n.name === 'sin') return { k: 'neg', a: F('cos', X) }; if (n.name === 'cos') return F('sin', X); if (n.name === 'exp') return F('exp', X) } throw bad()
    case 'bin':
      if (n.op === '+' || n.op === '-') return B(n.op, integ(n.a), integ(n.b))
      if (n.op === '*') { if (!hasVar(n.a)) return B('*', n.a, integ(n.b)); if (!hasVar(n.b)) return B('*', integ(n.a), n.b); throw bad() }
      if (n.op === '/') { if (!hasVar(n.b)) return B('/', integ(n.a), n.b); if (n.a.k === 'num' && n.b.k === 'var') return B('*', n.a, F('ln', F('abs', X))); throw bad() }
      { const e = simp(n.b)
        if (n.a.k === 'var' && e.k === 'num' && !e.s) return e.v === -1 ? F('ln', F('abs', X)) : B('/', B('^', X, N(e.v + 1)), N(e.v + 1)) }
      throw bad()
    default: throw bad()
  }
}
export const antiderivative = (n: Node) => simp(integ(n))

export const numDeriv = (n: Node, x: number) => { const h = 1e-5 * (1 + Math.abs(x)); return (evalNode(n, x + h) - evalNode(n, x - h)) / (2 * h) }
/** Simpson (N par) ou trapézio composto. Erro se f não for finita em algum nó. */
export function integrate(n: Node, a: number, b: number, method: 'simpson' | 'trapezoid', N_ = 1000): number {
  const m = method === 'simpson' ? N_ + (N_ % 2) : N_, h = (b - a) / m, f = (x: number) => { const y = evalNode(n, x); if (!Number.isFinite(y)) throw new Error(`f não é finita em x = ${+x.toPrecision(8)}: a integral numérica não se aplica.`); return y }
  let s = f(a) + f(b)
  for (let i = 1; i < m; i++) s += f(a + i * h) * (method === 'simpson' ? (i % 2 ? 4 : 2) : 2)
  return method === 'simpson' ? (s * h) / 3 : (s * h) / 2
}
export interface Side { value: number | null; note: string }
const side = (n: Node, a: number, dir: 1 | -1): Side => {
  const v = [1e-3, 1e-5, 1e-7].map(h => evalNode(n, a + dir * h))
  if (v.some(x => Number.isNaN(x))) return { value: null, note: 'f não está definida perto do ponto desse lado' }
  if (Math.abs(v[2]) > 1e3 && Math.abs(v[2]) > 10 * Math.abs(v[1])) return { value: null, note: v[2] > 0 ? 'tende a +∞' : 'tende a −∞' }
  if (Math.abs(v[2] - v[1]) > 1e-4 * (1 + Math.abs(v[2]))) return { value: null, note: 'não estabilizou (método numérico inconclusivo)' }
  return { value: v[2], note: 'estável' }
}
export function limitNumeric(n: Node, a: number) {
  const left = side(n, a, -1), right = side(n, a, 1)
  const agree = left.value !== null && right.value !== null && Math.abs(left.value - right.value) < 1e-4 * (1 + Math.abs(left.value))
  return { left, right, agree, value: agree ? (left.value! + right.value!) / 2 : null }
}
export function newton(n: Node, x0: number, maxIter = 60) {
  const dn = deriv(n); let x = x0
  for (let i = 1; i <= maxIter; i++) {
    const fx = evalNode(n, x), dx = evalNode(dn, x)
    if (!Number.isFinite(fx) || !Number.isFinite(dx)) return { ok: false as const, error: 'f ou f′ deixou de ser finita durante as iterações.' }
    if (dx === 0) return { ok: false as const, error: 'f′(x) = 0 em uma iteração: o método de Newton falhou. Tente outro x₀.' }
    const nx = x - fx / dx
    if (Math.abs(nx - x) < 1e-12 * (1 + Math.abs(nx)) && Math.abs(evalNode(n, nx)) < 1e-9) return { ok: true as const, root: nx, iterations: i, residual: evalNode(n, nx) }
    x = nx
  }
  return { ok: false as const, error: `Sem convergência em ${maxIter} iterações.` }
}
