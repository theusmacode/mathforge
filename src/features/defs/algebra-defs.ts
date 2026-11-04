import * as Mx from '../../core/matrix.ts'
import * as Pl from '../../core/poly.ts'
import { def, F, SEL, err, n, res, chk, type Def } from './kit.ts'
import { solveQuadratic } from '../../core/algebra.ts'

const MA = F('A|Matriz A||mx'), MB = F('B|Matriz B||mx')
const mt = (m: Mx.M) => ({ head: m[0].map((_, j) => `col ${j + 1}`), rows: m.map(r => r.map(x => n(x, 8))) })
const out = (m: Mx.M, label: string, formulas: string[], steps: string[] = []) => res([[label, `matriz ${Mx.dims(m)}`]], formulas, steps, ['Ponto flutuante; valores com |x| < 10⁻¹⁰ são exibidos como 0.'], mt(m))
const cat = 'algebra', sub = 'Matrizes'

export const algebraDefs: Def[] = [
  def('matriz-soma', 'Soma e subtração de matrizes', cat, sub, 'A±B', 'Soma ou subtração de matrizes de mesma dimensão.', ['matriz', 'adição'], [MA, MB, SEL('op', 'Operação', ['A + B', 'A − B'])],
    (v, t) => { const a = Mx.parseMatrix(t.A), b = Mx.parseMatrix(t.B); return out(Mx.add(a, b, v.op === 1 ? -1 : 1), v.op === 1 ? 'A − B' : 'A + B', ['(A ± B)ᵢⱼ = Aᵢⱼ ± Bᵢⱼ'], [`A é ${Mx.dims(a)} e B é ${Mx.dims(b)}`]) }),
  def('matriz-produto', 'Produto de matrizes', cat, sub, 'A·B', 'Multiplicação A·B (colunas de A = linhas de B).', ['matriz', 'multiplicação'], [MA, MB],
    (_, t) => { const a = Mx.parseMatrix(t.A), b = Mx.parseMatrix(t.B); return out(Mx.mul(a, b), 'A · B', ['(AB)ᵢⱼ = Σₖ Aᵢₖ·Bₖⱼ'], [`${Mx.dims(a)} · ${Mx.dims(b)} = ${Mx.dims(Mx.mul(a, b))}`]) }),
  def('matriz-escalar', 'Matriz por escalar', cat, sub, 'k·A', 'Multiplica todos os elementos por k.', ['matriz', 'escalar'], [MA, F('k|Escalar k')], ({ k }, t) => out(Mx.scale(Mx.parseMatrix(t.A), k!), 'k · A', ['(kA)ᵢⱼ = k·Aᵢⱼ'])),
  def('matriz-transposta', 'Matriz transposta', cat, sub, 'Aᵀ', 'Troca linhas por colunas.', ['matriz', 'transposta'], [MA], (_, t) => out(Mx.transpose(Mx.parseMatrix(t.A)), 'Aᵀ', ['(Aᵀ)ᵢⱼ = Aⱼᵢ'])),
  def('matriz-determinante', 'Determinante', cat, sub, 'det', 'Determinante de matriz quadrada até 8×8 (eliminação de Gauss).', ['matriz', 'determinante'], [MA],
    (_, t) => { const a = Mx.parseMatrix(t.A), d = Mx.det(a); return res([['det(A)', n(d, 10)], ['Invertível?', Math.abs(d) < 1e-10 ? 'Não (det = 0)' : 'Sim']], ['det por eliminação de Gauss com pivotamento parcial'], [`Matriz ${Mx.dims(a)}`], ['Ponto flutuante: |det| < 10⁻¹⁰ é tratado como 0.']) }),
  def('matriz-inversa', 'Matriz inversa', cat, sub, 'A⁻¹', 'Inversa por Gauss-Jordan, quando existir.', ['matriz', 'inversa'], [MA],
    (_, t) => { const a = Mx.parseMatrix(t.A), i = Mx.inverse(a); if (!i) return err('A matriz não tem inversa (determinante nulo).'); return out(i, 'A⁻¹', ['[A | I] → [I | A⁻¹]'], [`det(A) = ${n(Mx.det(a), 8)}`, `Verificação A·A⁻¹ ≈ I: erro máximo ${n(Math.max(...Mx.mul(a, i).flat().map((x, k, f) => Math.abs(x - (Math.floor(k / a.length) === k % a.length ? 1 : 0)))), 3)}`]) }),
  def('matriz-escalonamento', 'Escalonamento e posto', cat, sub, 'rref', 'Forma escalonada reduzida e posto (rank).', ['matriz', 'escalonamento', 'gauss', 'rank'], [MA],
    (_, t) => { const a = Mx.parseMatrix(t.A), r = Mx.rref(a); return { ...out(r.m, 'Forma escalonada reduzida', ['Gauss-Jordan com pivotamento parcial'], [`Posto = ${r.rank}; colunas-pivô: ${r.pivots.map(p => p + 1).join(', ') || 'nenhuma'}`]), outputs: [{ label: 'Posto (rank)', value: String(r.rank) }] } }),
  def('sistema-linear', 'Sistema linear (classificação e solução)', cat, sub, 'Ax=b', 'Resolve e classifica: possível determinado, indeterminado ou impossível.', ['sistema', 'equações lineares', 'gauss'], [F('A|Matriz aumentada [A ∣ b] — uma equação por linha||my')],
    (_, t) => { const a = Mx.parseMatrix(t.A), s = Mx.solveSystem(a), f = ['Escalonamento de [A | b]; compara posto de A, posto de [A|b] e nº de incógnitas']
      if (s.kind === 'none') return res([['Classificação', 'Sistema impossível (SI)']], f, ['Surgiu a equação 0 = c com c ≠ 0.'])
      if (s.kind === 'unique') return res([['Classificação', 'Possível e determinado (SPD)'], ...s.x.map((x, i): [string, string] => [`x${i + 1}`, n(x, 10)])], f, [`${a.length} equações, ${s.x.length} incógnitas, posto ${s.x.length}`])
      return { ...res([['Classificação', `Possível e indeterminado (SPI), ${s.free.length} grau(s) de liberdade`]], f, s.lines) } }),
  def('regra-cramer', 'Regra de Cramer', cat, sub, 'D', 'Sistema n×n pela razão de determinantes.', ['cramer', 'sistema', 'determinante'], [F('A|Matriz aumentada [A ∣ b], n×(n+1)||my')],
    (_, t) => { const a = Mx.parseMatrix(t.A), k = a.length; if (a[0].length !== k + 1) return err(`Informe n equações e n incógnitas (matriz n×(n+1)); recebi ${Mx.dims(a)}.`)
      const A = a.map(r => r.slice(0, k)), b = a.map(r => r[k]), D = Mx.det(A)
      if (Math.abs(D) < 1e-10) return err('D = 0: a regra de Cramer não se aplica (use o escalonamento para classificar o sistema).')
      const xs = A.map((_, j) => Mx.det(A.map((r, i) => r.map((x, c) => (c === j ? b[i] : x)))) / D)
      return res([['D = det(A)', n(D, 10)], ...xs.map((x, i): [string, string] => [`x${i + 1} = D${i + 1}/D`, n(x, 10)])], ['xᵢ = Dᵢ / D'], ['Dᵢ = determinante com a coluna i substituída por b']) }),
  def('polinomio-soma-sub', 'Soma e subtração de polinômios', cat, 'Polinômios', 'P±Q', 'Coeficientes do maior grau para o menor (ex.: 1 -3 2).', ['polinômio'], [F('p|P(x): coeficientes||t'), F('q|Q(x): coeficientes||t'), SEL('op', 'Operação', ['P + Q', 'P − Q'])],
    (v, t) => { const p = Pl.parsePoly(t.p), q = Pl.parsePoly(t.q), r = Pl.addP(p, q, v.op === 1 ? -1 : 1); return res([['Resultado', Pl.polyStr(r)], ['Grau', String(Pl.degree(r))]], ['Soma/subtração termo a termo'], [`P = ${Pl.polyStr(p)}`, `Q = ${Pl.polyStr(q)}`]) }),
  def('polinomio-produto', 'Produto de polinômios', cat, 'Polinômios', 'P·Q', 'Multiplicação por convolução dos coeficientes.', ['polinômio', 'multiplicação'], [F('p|P(x): coeficientes||t'), F('q|Q(x): coeficientes||t')],
    (_, t) => { const p = Pl.parsePoly(t.p), q = Pl.parsePoly(t.q), r = Pl.mulP(p, q); return res([['P · Q', Pl.polyStr(r)], ['Grau', String(Pl.degree(r))]], ['cₖ = Σ aᵢ·bⱼ, i + j = k'], [`(${Pl.polyStr(p)}) · (${Pl.polyStr(q)})`]) }),
  def('polinomio-divisao', 'Divisão de polinômios', cat, 'Polinômios', 'P÷Q', 'Quociente e resto: P = Q·D + R.', ['polinômio', 'divisão', 'resto'], [F('p|Dividendo P(x)||t'), F('q|Divisor Q(x)||t')],
    (_, t) => { const p = Pl.parsePoly(t.p), q = Pl.parsePoly(t.q), d = Pl.divP(p, q); const chkv = Pl.addP(Pl.mulP(q, d.q), d.r)
      return res([['Quociente', Pl.polyStr(d.q)], ['Resto', Pl.polyStr(d.r)]], ['P(x) = Q(x)·D(x) + R(x), grau(R) < grau(Q)'], [`Verificação Q·D + R = ${Pl.polyStr(chkv)}`], ['Divisão longa em ponto flutuante.']) }),
  def('polinomio-avaliacao', 'Valor de um polinômio (Horner)', cat, 'Polinômios', 'P(a)', 'Avalia P(x) em um ponto pelo método de Horner.', ['polinômio', 'horner'], [F('p|P(x): coeficientes||t'), F('x|Valor de x')],
    ({ x }, t) => { const p = Pl.parsePoly(t.p); return res([[`P(${n(x!)})`, n(Pl.horner(p, x!), 10)]], ['Horner: ((aₙx + aₙ₋₁)x + …) + a₀'], [`P(x) = ${Pl.polyStr(p)}`]) }),
  def('polinomio-fatoracao', 'Fatoração por raízes racionais', cat, 'Polinômios', 'fat', 'Teorema das raízes racionais, com coeficientes inteiros.', ['fatoração', 'raízes', 'polinômio'], [F('p|P(x): coeficientes inteiros||t')],
    (_, t) => { const p = Pl.parsePoly(t.p), r = Pl.rationalRoots(p), fr = (x: { p: bigint; q: bigint }) => (x.q === 1n ? `${x.p}` : `${x.p}/${x.q}`)
      const factors = r.roots.map(x => (x.q === 1n ? (x.p === 0n ? 'x' : `(x ${x.p < 0n ? '+' : '−'} ${(x.p < 0n ? -x.p : x.p)})`) : `(${x.q}x ${x.p < 0n ? '+' : '−'} ${(x.p < 0n ? -x.p : x.p)})`))
      const rest = r.rest.length > 1 || r.rest[0] !== 1 ? `(${Pl.polyStr(r.rest)})` : ''
      return res([['Raízes racionais', r.roots.length ? r.roots.map(fr).join(' ; ') : 'nenhuma'], ['Forma fatorada', [...factors, rest].filter(Boolean).join('') || Pl.polyStr(p)]], ['Candidatas p/q: p divide a₀ e q divide aₙ'], [`P(x) = ${Pl.polyStr(p)}`], ['Exato (inteiros). O fator restante pode ter raízes irracionais ou complexas que este método não encontra.']) }),
  def('produtos-notaveis', 'Produtos notáveis', cat, 'Polinômios', '(a+b)²', 'Quadrado da soma/diferença, diferença de quadrados e cubos.', ['produto notável', 'quadrado da soma'], [F('a|a'), F('b|b')],
    ({ a, b }) => { const A = a!, B = b!; return res([['(a + b)²', `a² + 2ab + b² = ${n(A * A + 2 * A * B + B * B)}`], ['(a − b)²', `a² − 2ab + b² = ${n(A * A - 2 * A * B + B * B)}`], ['(a + b)(a − b)', `a² − b² = ${n(A * A - B * B)}`], ['(a + b)³', `a³ + 3a²b + 3ab² + b³ = ${n((A + B) ** 3)}`], ['(a − b)³', `a³ − 3a²b + 3ab² − b³ = ${n((A - B) ** 3)}`]], ['Identidades algébricas'], [`Com a = ${n(A)} e b = ${n(B)}`]) }),
  def('inequacao-linear', 'Inequação do 1º grau', cat, 'Equações', 'ax+b<c', 'Resolve ax + b ⋚ c e mostra o intervalo.', ['inequação', 'desigualdade'], [F('a|a'), F('b|b'), SEL('op', 'Sinal', ['<', '≤', '>', '≥']), F('c|c')],
    ({ a, b, op, c }) => { const s = ['<', '≤', '>', '≥'][op!]
      if (a === 0) { const ok = [b! < c!, b! <= c!, b! > c!, b! >= c!][op!]; return res([['Solução', ok ? 'Todos os reais' : 'Conjunto vazio']], ['a = 0: a desigualdade vira b ' + s + ' c'], [`${n(b!)} ${s} ${n(c!)} é ${ok ? 'verdadeira' : 'falsa'}`]) }
      const flip = a! < 0, ss = flip ? { '<': '>', '≤': '≥', '>': '<', '≥': '≤' }[s]! : s, x = (c! - b!) / a!
      return res([['Solução', `x ${ss} ${n(x)}`]], ['x ' + ss + ' (c − b)/a'], [flip ? 'a < 0: o sentido da desigualdade se inverte' : 'a > 0: o sentido é mantido', `x ${ss} (${n(c!)} − ${n(b!)}) / ${n(a!)}`]) }),
  def('inequacao-quadratica', 'Inequação do 2º grau', cat, 'Equações', 'ax²+bx+c', 'Resolve ax² + bx + c ⋚ 0 pelo estudo do sinal.', ['inequação', 'quadrática', 'sinal'], [F('a|a'), F('b|b'), F('c|c'), SEL('op', 'Sinal', ['< 0', '≤ 0', '> 0', '≥ 0'])],
    ({ a, b, c, op }) => { const e = chk([a === 0, 'Para ser do 2º grau, a deve ser ≠ 0 (use a inequação do 1º grau).']); if (e) return e
      const q = solveQuadratic(a!, b!, c!), strict = op === 0 || op === 2, wantPos = op! >= 2, up = a! > 0; let sol: string
      if (q.kind === 'complex') sol = (up === wantPos) ? 'Todos os reais' : 'Conjunto vazio'
      else if (q.kind === 'one-real') { const x = n(q.x); sol = up === wantPos ? (strict ? `x ≠ ${x}` : 'Todos os reais') : (strict ? 'Conjunto vazio' : `x = ${x}`) }
      else if (q.kind === 'two-real') { const [x1, x2] = [n(q.x1), n(q.x2)], outside = up === wantPos; sol = outside ? (strict ? `x < ${x1} ou x > ${x2}` : `x ≤ ${x1} ou x ≥ ${x2}`) : (strict ? `${x1} < x < ${x2}` : `${x1} ≤ x ≤ ${x2}`) }
      else return err('Caso inesperado.')
      return res([['Solução', sol]], ['Δ = b² − 4ac; sinal de a e raízes determinam o sinal da parábola'], [`a ${up ? '> 0' : '< 0'}: parábola voltada para ${up ? 'cima' : 'baixo'}`, `Δ = ${n(b! * b! - 4 * a! * c!)}`]) }),
  def('equacao-modulo', 'Equação modular |ax + b| = c', cat, 'Equações', '|x|', 'Resolve |ax + b| = c.', ['módulo', 'valor absoluto'], [F('a|a'), F('b|b'), F('c|c')],
    ({ a, b, c }) => { if (c! < 0) return res([['Solução', 'Conjunto vazio']], ['|u| = c só tem solução se c ≥ 0'], ['c < 0: o módulo nunca é negativo']); if (a === 0) return res([['Solução', Math.abs(b!) === c ? 'Todos os reais' : 'Conjunto vazio']], ['a = 0'], [])
      const x1 = (c! - b!) / a!, x2 = (-c! - b!) / a!; return res([['Solução', x1 === x2 ? n(x1) : `${n(Math.min(x1, x2))} ; ${n(Math.max(x1, x2))}`]], ['ax + b = c  ou  ax + b = −c'], [`x = (c − b)/a = ${n(x1)}`, `x = (−c − b)/a = ${n(x2)}`]) }),
  def('equacao-exponencial', 'Equação exponencial aˣ = b', cat, 'Equações', 'aˣ', 'Resolve aˣ = b com a > 0 e a ≠ 1.', ['exponencial', 'logaritmo'], [F('a|Base a'), F('b|b')],
    ({ a, b }) => { const e = chk([!(a! > 0) || a === 1, 'A base deve ser positiva e diferente de 1.'], [!(b! > 0), 'Para base positiva, aˣ é sempre positivo: b deve ser > 0.']); return e ?? res([['x', n(Math.log(b!) / Math.log(a!), 10)]], ['x = ln b / ln a'], [`x = ln(${n(b!)}) / ln(${n(a!)})`]) }),
  def('equacao-logaritmica', 'Equação logarítmica logₐ(x) = b', cat, 'Equações', 'log', 'Resolve logₐ(x) = b, com condição de existência.', ['logaritmo'], [F('a|Base a'), F('b|b')],
    ({ a, b }) => chk([!(a! > 0) || a === 1, 'A base deve ser positiva e diferente de 1.']) ?? res([['x', n(Math.pow(a!, b!), 10)]], ['x = aᵇ (condição: x > 0)'], [`x = ${n(a!)}^${n(b!)}`])),
  def('logaritmo-mudanca-base', 'Logaritmo em qualquer base', 'algebra', 'Equações', 'logₐb', 'Calcula logₐ(b) pela mudança de base.', ['logaritmo', 'mudança de base'], [F('a|Base a'), F('b|Logaritmando b')],
    ({ a, b }) => chk([!(a! > 0) || a === 1, 'A base deve ser positiva e diferente de 1.'], [!(b! > 0), 'O logaritmando deve ser positivo.']) ?? res([[`log${n(a!)}(${n(b!)})`, n(Math.log(b!) / Math.log(a!), 10)]], ['logₐb = ln b / ln a'], [])),
]
