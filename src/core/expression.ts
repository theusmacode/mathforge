/** Parser recursivo-descendente. Sem eval/Function: só tokens, números, constantes e funções da lista branca. */
export type AngleMode = 'deg' | 'rad'
export type EvalResult = { ok: true; value: number } | { ok: false; error: string }

const MAX_LEN = 200
const CONSTS = new Map<string, number>([['pi', Math.PI], ['e', Math.E]])
const toRad = (x: number, m: AngleMode) => (m === 'deg' ? (x * Math.PI) / 180 : x)
const fromRad = (x: number, m: AngleMode) => (m === 'deg' ? (x * 180) / Math.PI : x)
const snap = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x) // ruído de ponto flutuante em sin(180°) etc.

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error('Fatorial só existe para inteiros não negativos.')
  if (n > 170) throw new Error('Fatorial acima de 170 excede o limite numérico.')
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r
}
const funcs = (m: AngleMode): Map<string, (x: number) => number> => new Map<string, (x: number) => number>([
  ['sqrt', x => { if (x < 0) throw new Error('Raiz quadrada de número negativo não é real.'); return Math.sqrt(x) }],
  ['cbrt', Math.cbrt], ['abs', Math.abs], ['exp', Math.exp], ['floor', Math.floor], ['ceil', Math.ceil], ['round', Math.round],
  ['ln', x => { if (x <= 0) throw new Error('O logaritmo exige um valor positivo.'); return Math.log(x) }],
  ['log', x => { if (x <= 0) throw new Error('O logaritmo exige um valor positivo.'); return Math.log10(x) }],
  ['log2', x => { if (x <= 0) throw new Error('O logaritmo exige um valor positivo.'); return Math.log2(x) }],
  ['sin', x => snap(Math.sin(toRad(x, m)))], ['cos', x => snap(Math.cos(toRad(x, m)))],
  ['tan', x => { const c = Math.cos(toRad(x, m)); if (Math.abs(c) < 1e-12) throw new Error('A tangente não é definida nesse ângulo.'); return snap(Math.tan(toRad(x, m))) }],
  ['asin', x => { if (Math.abs(x) > 1) throw new Error('asin exige valor entre −1 e 1.'); return fromRad(Math.asin(x), m) }],
  ['acos', x => { if (Math.abs(x) > 1) throw new Error('acos exige valor entre −1 e 1.'); return fromRad(Math.acos(x), m) }],
  ['atan', x => fromRad(Math.atan(x), m)],
  ['sinh', Math.sinh], ['cosh', Math.cosh], ['tanh', Math.tanh],
])

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }
function tokenize(s: string): Tok[] {
  const out: Tok[] = []; let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/\s/.test(ch)) { i++; continue }
    const num = /^(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?/.exec(s.slice(i))
    if (num) { out.push({ t: 'num', v: Number(num[0].replace(',', '.')) }); i += num[0].length; continue }
    const id = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(s.slice(i))
    if (id) { out.push({ t: 'id', v: id[0].toLowerCase() }); i += id[0].length; continue }
    if ('+-*/^()!%×÷'.includes(ch)) { out.push({ t: 'op', v: ch === '×' ? '*' : ch === '÷' ? '/' : ch }); i++; continue }
    throw new Error(`Caractere não permitido: “${ch}”.`)
  }
  return out
}

export function evaluate(input: string, mode: AngleMode = 'rad', vars: Record<string, number> = {}): EvalResult {
  try {
    if (!input.trim()) throw new Error('Digite uma expressão.')
    if (input.length > MAX_LEN) throw new Error(`Expressão longa demais (máximo ${MAX_LEN} caracteres).`)
    const toks = tokenize(input); const F = funcs(mode); let p = 0
    const peek = () => toks[p]
    const isOp = (v: string) => peek()?.t === 'op' && peek().v === v
    const expect = (v: string) => { if (!isOp(v)) throw new Error(`Esperado “${v}”.`); p++ }
    const expr = (): number => { let a = term(); while (isOp('+') || isOp('-')) { const o = toks[p++].v; const b = term(); a = o === '+' ? a + b : a - b } return a }
    const term = (): number => { let a = unary(); while (isOp('*') || isOp('/')) { const o = toks[p++].v; const b = unary()
      if (o === '/') { if (b === 0) throw new Error('Divisão por zero.'); a /= b } else a *= b } return a }
    const unary = (): number => { if (isOp('-')) { p++; return -unary() } if (isOp('+')) { p++; return unary() } return power() }
    const power = (): number => { const b = postfix(); if (isOp('^')) { p++; const e = unary(); return Math.pow(b, e) } return b }
    const postfix = (): number => { let a = primary(); while (isOp('!') || isOp('%')) { const o = toks[p++].v; a = o === '!' ? factorial(a) : a / 100 } return a }
    const primary = (): number => {
      const k = toks[p++]
      if (!k) throw new Error('Expressão incompleta.')
      if (k.t === 'num') return k.v
      if (k.t === 'op' && k.v === '(') { const v = expr(); expect(')'); return v }
      if (k.t === 'id') {
        if (Object.prototype.hasOwnProperty.call(vars, k.v)) return vars[k.v]
        if (CONSTS.has(k.v)) return CONSTS.get(k.v)!
        const f = F.get(k.v)
        if (!f) throw new Error(`“${k.v}” não é uma função ou constante conhecida.`)
        expect('('); const v = expr(); expect(')'); return f(v)
      }
      throw new Error(`Símbolo inesperado: “${k.v}”.`)
    }
    const value = expr()
    if (p < toks.length) throw new Error('Expressão inválida: sobrou conteúdo após o fim.')
    if (!Number.isFinite(value)) throw new Error('O resultado não é um número finito.')
    return { ok: true, value }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Expressão inválida.' } }
}
