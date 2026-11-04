/** Gráficos e comparações calculados a partir das ENTRADAS e dos motores existentes (nunca valores fixos). */
import type { Chart, Compare, Values, Seg } from '../core/types.ts'
import * as Fi from '../core/finance2.ts'
import * as Co from '../core/commercial.ts'
import * as C from '../core/calculus.ts'
import * as T from '../core/triangle.ts'
import { describe, frequencies, parseData } from '../core/stats.ts'
import { regression } from '../core/prob.ts'
import { runs, yRange, type Pt } from '../core/plot.ts'
import { list } from './defs/kit.ts'
import * as Fr from '../core/fraction.ts'
import * as D from '../core/discrete.ts'
import * as Pr from '../core/prob.ts'
import { solveQuadratic } from '../core/algebra.ts'
import { pythagoras } from '../core/geometry.ts'
import { progression, fibonacci } from '../core/discrete.ts'

export interface Visual { chart?: Chart; charts?: Chart[]; compare?: Compare }
const G = 9.81
const cap = (k: number) => Math.min(Math.max(1, Math.ceil(k)), 240)
const xsTo = (T_: number, n = 60) => Array.from({ length: n + 1 }, (_, i) => (T_ * i) / n)
const curve = (f: (x: number) => number, x0: number, x1: number, n = 400): Seg[] => { const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n, y = f(x); return { x, y: Number.isFinite(y) ? y : null } }); const [lo, hi] = yRange([pts]); return runs(pts, lo, hi).map(r => r.map(p => [p.x, p.y as number] as [number, number])) }
const line = (title: string, x: string, y: string, series: { name: string; segs: Seg[]; dashed?: boolean }[], extra: Partial<Extract<Chart, { kind: 'line' }>> = {}): Chart => ({ kind: 'line', title, x, y, series, ...extra })
const cmp = (a: string, av: number, b: string, bv: number, unit?: string): Compare => ({ a: { label: a, value: av }, b: { label: b, value: bv }, unit })
const fn = (src: string) => { const n = C.parse(src); return (x: number) => C.evalNode(n, x) }

export function visualFor(id: string, v: Values, t: Record<string, string>): Visual {
  try { return build(id, v, t) } catch { return {} }
}
function build(id: string, v: Values, t: Record<string, string>): Visual {
  switch (id) {
    // ---- comercial: valor original × resultado ----
    case 'desconto-acrescimo': { const r = Co.applyPct(v.v!, v.p!, v.m === 1 ? 'increase' : 'discount'); return r.ok ? { compare: cmp('Valor original', v.v!, v.m === 1 ? 'Com acréscimo' : 'Com desconto', r.value, 'R$') } : {} }
    case 'valor-original': { const r = Co.originalValue(v.f!, v.p!, v.m === 1 ? 'increase' : 'discount'); return r.ok ? { compare: cmp('Valor original', r.value, 'Valor final', v.f!, 'R$') } : {} }
    case 'variacao-percentual': return { compare: cmp('Valor inicial', v.a!, 'Valor final', v.b!) }
    case 'porcentagem': return { compare: cmp('Valor (100%)', v.v!, `${v.p}% do valor`, (v.p! / 100) * v.v!) }
    case 'margem-markup': return { compare: cmp('Custo', v.c!, 'Preço de venda', v.p!, 'R$') }
    case 'preco-venda': return { compare: cmp('Custo', v.c!, 'Preço de venda', v.k === 1 ? v.c! / (1 - v.m! / 100) : v.c! * (1 + v.m! / 100), 'R$') }
    // ---- finanças ----
    case 'juros-compostos': case 'juros-simples': {
      const comp = id === 'juros-compostos', xs = [...new Set([...Array.from({ length: cap(v.t!) + 1 }, (_, k) => Math.min(k * (v.t! / cap(v.t!)), v.t!)), v.t!])]
      const f = (x: number) => (comp ? v.c! * Math.pow(1 + v.i! / 100, x) : v.c! * (1 + (v.i! / 100) * x))
      return { chart: line('Evolução do montante', 'Períodos', 'R$', [{ name: 'Montante', segs: [xs.map(x => [x, f(x)] as [number, number])] }, { name: 'Capital inicial', segs: [[[0, v.c!], [v.t!, v.c!]]], dashed: true }]) } }
    case 'tabela-price': case 'tabela-sac': { if (!(v.v! > 0) || !Number.isInteger(v.n!) || v.n! < 1 || v.i! < 0) return {}; const r = (id === 'tabela-price' ? Fi.price : Fi.sac)(v.v!, v.i! / 100, v.n!); return { chart: line('Saldo devedor', 'Parcela', 'R$', [{ name: 'Saldo devedor', segs: [[[0, v.v!], ...r.map(x => [x.k, x.balance] as [number, number])]] }, { name: 'Prestação', segs: [r.map(x => [x.k, x.pmt] as [number, number])], dashed: true }]) } }
    case 'comparacao-price-sac': { if (!(v.v! > 0) || !Number.isInteger(v.n!) || v.n! < 1 || v.i! < 0) return {}; const p = Fi.price(v.v!, v.i! / 100, v.n!), s = Fi.sac(v.v!, v.i! / 100, v.n!); return { chart: line('Prestação ao longo do prazo', 'Parcela', 'R$', [{ name: 'Price', segs: [p.map(x => [x.k, x.pmt] as [number, number])] }, { name: 'SAC', segs: [s.map(x => [x.k, x.pmt] as [number, number])] }]) } }
    case 'valor-futuro-aportes': { const i = v.i! / 100, N = Math.min(v.n!, 600); let b = v.c!; const m: Seg = [[0, b]], inv: Seg = [[0, b]]
      for (let k = 1; k <= N; k++) { b = v.t === 1 ? (b + v.p!) * (1 + i) : b * (1 + i) + v.p!; m.push([k, b]); inv.push([k, v.c! + v.p! * k]) }
      return { chart: line('Evolução do investimento', 'Períodos', 'R$', [{ name: 'Montante', segs: [m] }, { name: 'Total investido', segs: [inv], dashed: true }]) } }
    // ---- estatística ----
    case 'estatistica-descritiva': { const p = parseData(t.dados); if (!p.ok) return {}; const f = frequencies(describe(p.values).sorted).slice(0, 40); return { chart: { kind: 'bars', title: 'Distribuição de frequências', y: 'Frequência', labels: f.map(x => x.label), values: f.map(x => x.count) } } }
    case 'correlacao-regressao': { const x = list(t.x), y = list(t.y), r = regression(x, y); return { chart: { kind: 'scatter', title: 'Dispersão e reta de regressão', x: 'X', y: 'Y', pts: x.map((a, i) => [a, y[i]] as [number, number]), fit: [r.slope, r.intercept] } } }
    // ---- geometria ----
    case 'retangulo': return shape('rect', 'Retângulo', { w: v.b!, h: v.h! }, { w: `b = ${v.b}`, h: `h = ${v.h}`, d: `d = ${p5(Math.hypot(v.b!, v.h!))}`, mid: `A = ${p5(v.b! * v.h!)}` })
    case 'circulo': return shape('circle', 'Círculo', { r: v.r! }, { r: `r = ${v.r}`, d: `d = ${p5(2 * v.r!)}`, mid: `A = ${p5(Math.PI * v.r! * v.r!)}`, c: `C = ${p5(2 * Math.PI * v.r!)}` })
    case 'setor-circular': return shape('sector', 'Setor circular', { r: v.r!, t: v.u === 1 ? v.a! : (v.a! * Math.PI) / 180 }, { r: `r = ${v.r}`, t: `θ = ${v.a}${v.u === 1 ? ' rad' : '°'}` })
    case 'trapezio': return shape('trapezoid', 'Trapézio', { B: v.b1!, b: v.b2!, h: v.h! }, { B: `B = ${v.b1}`, b: `b = ${v.b2}`, h: `h = ${v.h}` })
    case 'losango': return shape('rhombus', 'Losango', { D: v.d1!, d: v.d2! }, { D: `D = ${v.d1}`, d: `d = ${v.d2}` })
    case 'triangulo-sss': return tri(T.fromSides(v.a!, v.b!, v.c!))
    case 'triangulo-sas': return tri(T.sas(v.a!, v.b!, v.c!))
    case 'triangulo-asa': return tri(T.asa(v.a!, v.b!, v.c!))
    case 'triangulo-ssa': { const s = T.ssa(v.a!, v.b!, v.c!); if (!s.length) return {}; const all = s.map((x, i) => tri(x, s.length === 2 ? `Solução ${i + 1} de 2: B = ${+x.B.toPrecision(6)}°` : undefined).chart!); return { chart: all[0], charts: all.length > 1 ? all : undefined } }
    case 'relacoes-metricas-retangulo': return tri(T.fromSides(Math.hypot(v.b!, v.c!), v.b!, v.c!), 'Triângulo retângulo')
    case 'cubo': return shape('cuboid', 'Cubo', { a: v.a!, b: v.a!, c: v.a! }, { a: `a = ${v.a}`, b: `a = ${v.a}`, c: `a = ${v.a}` }, 'Representação oblíqua esquemática')
    case 'paralelepipedo': return shape('cuboid', 'Paralelepípedo', { a: v.a!, b: v.b!, c: v.c! }, { a: `${v.a}`, b: `${v.b}`, c: `${v.c}` }, 'Representação oblíqua esquemática (profundidade reduzida)')
    case 'cilindro': return shape('cylinder', 'Cilindro', { r: v.r!, h: v.h! }, { r: `r = ${v.r}`, h: `h = ${v.h}` })
    case 'cone': return shape('cone', 'Cone', { r: v.r!, h: v.h! }, { r: `r = ${v.r}`, h: `h = ${v.h}` })
    case 'esfera': return shape('sphere', 'Esfera', { r: v.r! }, { r: `r = ${v.r}` })
    // ---- física ----
    case 'movimento-uniforme': { const xs = xsTo(Math.max(v.t!, 1e-9)); return { chart: line('Posição × tempo', 't (s)', 's (m)', [{ name: 's(t)', segs: [xs.map(x => [x, v.s0! + v.v! * x] as [number, number])] }]) } }
    case 'movimento-muv': { const xs = xsTo(Math.max(v.t!, 1e-9)); return { chart: line('Posição × tempo', 't (s)', 's (m)', [{ name: 's(t)', segs: [xs.map(x => [x, v.s0! + v.v0! * x + 0.5 * v.a! * x * x] as [number, number])] }, { name: 'v(t)', segs: [xs.map(x => [x, v.v0! + v.a! * x] as [number, number])], dashed: true }]) } }
    case 'queda-livre': { const g = v.g ?? G, Tt = Math.sqrt((2 * v.h!) / g); return { chart: line('Altura × tempo', 't (s)', 'h (m)', [{ name: 'h(t)', segs: [xsTo(Tt).map(x => [x, v.h! - 0.5 * g * x * x] as [number, number])] }]) } }
    case 'lancamento-vertical': { const g = v.g ?? G, h0 = v.h0 ?? 0, Tt = (v.v0! + Math.sqrt(v.v0! ** 2 + 2 * g * h0)) / g; return { chart: line('Altura × tempo', 't (s)', 'h (m)', [{ name: 'h(t)', segs: [xsTo(Tt).map(x => [x, h0 + v.v0! * x - 0.5 * g * x * x] as [number, number])] }]) } }
    // ---- cálculo ----
    case 'derivada': { const f = fn(t.f), d = fn(C.str(C.deriv(C.parse(t.f)))), c = v.x0 ?? 0
      return { chart: line('f(x) e f′(x)', 'x', 'y', [{ name: 'f(x)', segs: curve(f, c - 5, c + 5) }, { name: 'f′(x)', segs: curve(d, c - 5, c + 5), dashed: true }], { marks: v.x0 !== undefined ? [[c, f(c)]] : undefined }) } }
    case 'integral-definida': { const f = fn(t.f), a = Math.min(v.a!, v.b!), b = Math.max(v.a!, v.b!), pad = Math.max((b - a) * 0.25, 0.5); return { chart: line('Área sob a curva', 'x', 'f(x)', [{ name: 'f(x)', segs: curve(f, a - pad, b + pad) }], { area: [a, b] }) } }
    case 'integral-indefinida': { const n = C.parse(t.f), F = fn(C.str(C.antiderivative(n))); return { chart: line('f(x) e uma primitiva F(x) (C = 0)', 'x', 'y', [{ name: 'f(x)', segs: curve(fn(t.f), -5, 5) }, { name: 'F(x)', segs: curve(F, -5, 5), dashed: true }]) } }
    case 'raiz-newton': { const r = C.newton(C.parse(t.f), v.x0!); if (!r.ok) return {}; return { chart: line('Função e raiz encontrada', 'x', 'f(x)', [{ name: 'f(x)', segs: curve(fn(t.f), r.root - 3, r.root + 3) }], { marks: [[r.root, 0]] }) } }
    case 'limite-numerico': { const f = fn(t.f), a = v.a!, l = C.limitNumeric(C.parse(t.f), a); return { chart: line('Comportamento perto do ponto', 'x', 'f(x)', [{ name: 'f(x)', segs: curve(f, a - 2, a + 2) }], { marks: l.agree ? [[a, l.value as number]] : undefined }) } }
    case 'fracoes': { const a = Fr.frac(v.n1!, v.d1!), b = Fr.frac(v.n2!, v.d2!), r = [Fr.add, Fr.sub, Fr.mul, Fr.div][v.op! - 1](a, b); if (Math.max(a.d, b.d, r.d) > 24) return {}
      return { chart: { kind: 'fractions', title: 'Modelo de barras', rows: [{ label: 'A', n: a.n, d: a.d }, { label: 'B', n: b.n, d: b.d }, { label: 'Resultado', n: r.n, d: r.d }] } } }
    case 'simplificar-fracao': { const a = { n: v.n!, d: v.d! }, r = Fr.frac(v.n!, v.d!); if (a.d <= 0 || a.d > 24 || a.n < 0) return {}; return { chart: { kind: 'fractions', title: 'Frações equivalentes', rows: [{ label: 'Original', ...a }, { label: 'Irredutível', n: r.n, d: r.d }] } } }
    case 'conjuntos': { const A = D.parseSet(t.A), B = D.parseSet(t.B), o = D.setOps(A, B); return { chart: { kind: 'venn', title: 'Diagrama de Venn', a: A, b: B, only: o.aMinusB, both: o.inter, onlyB: o.bMinusA, nameA: 'A', nameB: 'B' } } }
    case 'distribuicao-binomial': { const N = v.n!, k = v.k!, lo = N > 60 ? Math.max(0, Math.round(N * v.p! - 30)) : 0, hi = N > 60 ? Math.min(N, lo + 60) : N; const ks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
      return { chart: { kind: 'bars', title: `P(X = k) para n = ${N}, p = ${v.p}${k >= lo && k <= hi ? `  (k = ${k}: ${+Pr.binomPmf(N, v.p!, k).toPrecision(5)})` : ''}`, y: 'Probabilidade', labels: ks.map(String), values: ks.map(x => Pr.binomPmf(N, v.p!, x)) } } }
    case 'distribuicao-normal': { const a = v.m! - 4 * v.s!, b = v.m! + 4 * v.s!; return { chart: line('Curva normal e P(X ≤ x)', 'x', 'densidade', [{ name: 'f(x)', segs: [xsTo(1, 200).map(u => [a + (b - a) * u, Pr.normalPdf(a + (b - a) * u, v.m!, v.s!)] as [number, number])] }], { area: [a, Math.min(Math.max(v.x!, a), b)], marks: [[Math.min(Math.max(v.x!, a), b), Pr.normalPdf(v.x!, v.m!, v.s!)]] }) } }
    case 'funcao-afim': case 'equacao-1grau': case 'inequacao-linear': { const withC = id !== 'funcao-afim', A = v.a!, B = v.b!, root = A !== 0 ? (withC ? (v.c! - B) / A : -B / A) : 0, w = Math.max(5, Math.abs(root) * 1.5), f = (x: number) => A * x + B
      const sers = [{ name: withC ? 'ax + b' : 'f(x)', segs: curve(f, root - w, root + w, 100) }, ...(withC ? [{ name: `y = ${v.c}`, segs: [[[root - w, v.c!], [root + w, v.c!]] as Seg], dashed: true }] : [])]
      return { chart: line(id === 'inequacao-linear' ? 'Onde ax + b está acima ou abaixo de c' : withC ? 'Interseção de ax + b com c' : 'Gráfico da função afim', 'x', 'y', sers, { marks: A !== 0 ? [[root, withC ? v.c! : 0]] : undefined }) } }
    case 'funcao-quadratica': case 'equacao-2grau': case 'inequacao-quadratica': { const A = v.a!, B = v.b!, Cc = v.c!; if (A === 0) return {}; const q = solveQuadratic(A, B, Cc), xv = -B / (2 * A), yv = A * xv * xv + B * xv + Cc
      const span = Math.max(2, q.kind === 'two-real' ? Math.abs(q.x2 - q.x1) * 0.9 : 3), marks: [number, number][] = [[xv, yv]]; if (q.kind === 'two-real') marks.push([q.x1, 0], [q.x2, 0]); if (q.kind === 'one-real') marks.push([q.x, 0])
      return { chart: line('Parábola, vértice e raízes', 'x', 'y', [{ name: 'f(x)', segs: curve(x => A * x * x + B * x + Cc, xv - span, xv + span, 160) }, { name: `eixo x = ${+xv.toPrecision(5)}`, segs: [[[xv, yv - Math.abs(yv) - 5], [xv, yv + Math.abs(yv) + 5]]], dashed: true }], { marks }) } }
    case 'amplitude-periodo': { const per = (2 * Math.PI) / Math.abs(v.B!), x0 = -v.C! / v.B!; return { chart: line('y = A·sen(Bx + C) + D', 'x', 'y', [{ name: 'y(x)', segs: curve(x => v.A! * Math.sin(v.B! * x + v.C!) + v.D!, x0 - per * 0.25, x0 + per * 1.75, 300) }, { name: `linha média y = ${v.D}`, segs: [[[x0 - per * 0.25, v.D!], [x0 + per * 1.75, v.D!]]], dashed: true }]) } }
    case 'razoes-trigonometricas': return unit(v.u === 1 ? v.a! : (v.a! * Math.PI) / 180)
    case 'graus-radianos': return unit(v.d === 1 ? v.v! : (v.v! * Math.PI) / 180)
    case 'trig-inversas': return unit(Math.atan(v.v!), 'Ângulo cuja tangente é o valor (arctan)')
    case 'pa-pg': { const N = Math.min(v.n!, 40); const pts = Array.from({ length: N }, (_, k) => [k + 1, progression(v.k === 1 ? 'pg' : 'pa', v.a1!, v.r!, k + 1).an] as [number, number]); return { chart: line(`Primeiros ${N} termos`, 'n', 'aₙ', [{ name: 'aₙ', segs: [pts] }], { marks: pts.length ? [pts[pts.length - 1]] : undefined }) } }
    case 'fibonacci': { const N = Math.min(v.n!, 30); return { chart: { kind: 'bars', title: `F(0) … F(${N})`, y: 'F(k)', labels: Array.from({ length: N + 1 }, (_, k) => String(k)), values: Array.from({ length: N + 1 }, (_, k) => Number(fibonacci(k))) } } }
    case 'pitagoras': { const r = pythagoras(v.a, v.b, v.c); return r.ok ? shape('triangle', 'Triângulo retângulo', { a: r.b, b: r.c, c: r.a }, { a: `b = ${p5(r.b)}`, b: `c = ${p5(r.c)} (hipotenusa)`, c: `a = ${p5(r.a)}` }, 'Proporcional aos lados calculados') : {} }
    case 'equacao-modulo': { const A = v.a!, B = v.b!, c = v.c!; if (A === 0 || c < 0) return {}; const x1 = (c - B) / A, x2 = (-c - B) / A, mid = (x1 + x2) / 2, w = Math.max(3, Math.abs(x1 - x2))
      return { chart: line('|ax + b| e a reta y = c', 'x', 'y', [{ name: '|ax + b|', segs: curve(x => Math.abs(A * x + B), mid - w, mid + w, 200) }, { name: `y = ${c}`, segs: [[[mid - w, c], [mid + w, c]]], dashed: true }], { marks: [[x1, c], [x2, c]] }) } }
    case 'equacao-exponencial': { const a = v.a!, b = v.b!; if (!(a > 0) || a === 1 || !(b > 0)) return {}; const r = Math.log(b) / Math.log(a)
      return { chart: line('aˣ e a reta y = b', 'x', 'y', [{ name: `${a}^x`, segs: curve(x => Math.pow(a, x), r - 3, r + 3, 200) }, { name: `y = ${b}`, segs: [[[r - 3, b], [r + 3, b]]], dashed: true }], { marks: [[r, b]] }) } }
    case 'equacao-logaritmica': { const a = v.a!, b = v.b!; if (!(a > 0) || a === 1) return {}; const r = Math.pow(a, b), hi = Math.max(r * 1.8, 3), lo = Math.min(hi / 200, 0.02)
      return { chart: line('logₐ(x) e a reta y = b', 'x', 'y', [{ name: `log${a}(x)`, segs: curve(x => Math.log(x) / Math.log(a), lo, hi, 300) }, { name: `y = ${b}`, segs: [[[lo, b], [hi, b]]], dashed: true }], { marks: [[r, b]] }) } }
    case 'lei-hooke': { const k = v.k!, x = v.x!, xs = xsTo(Math.abs(x) || 1, 40).map(u => (x < 0 ? -u : u)); return { chart: line('Força elástica × deformação (reta de inclinação k)', 'x (m)', 'F (N)', [{ name: 'F = k·x', segs: [xs.map(u => [u, k * u] as [number, number])] }], { marks: [[x, k * x]] }) } }
    case 'probabilidade-simples': { if (!Number.isInteger(v.f!) || !Number.isInteger(v.t!) || v.t! < 1 || v.t! > 24 || v.f! > v.t!) return {}; return { chart: { kind: 'fractions', title: 'Casos favoráveis entre os possíveis', rows: [{ label: 'P(A)', n: v.f!, d: v.t! }, { label: 'P(não A)', n: v.t! - v.f!, d: v.t! }] } } }
    default: return {}
  }
}
const shape = (s: Extract<Chart, { kind: 'shape' }>['shape'], title: string, dims: Record<string, number>, labels: Record<string, string>, note?: string): Visual => ({ chart: { kind: 'shape', shape: s, title, dims, labels, note } })
const p5 = (x: number) => +x.toPrecision(5)
const tri = (x: T.Tri, note?: string): Visual => shape('triangle', 'Triângulo (proporcional aos lados)', { a: x.a, b: x.b, c: x.c }, { a: `a = ${p5(x.a)}`, b: `b = ${p5(x.b)}`, c: `c = ${p5(x.c)}`, A: `A = ${p5(x.A)}°`, B: `B = ${p5(x.B)}°`, C: `C = ${p5(x.C)}°` }, note)
const unit = (t_: number, title = 'Círculo trigonométrico'): Visual => shape('unitcircle', title, { t: t_ }, { s: `sen = ${p5(Math.sin(t_))}`, c: `cos = ${p5(Math.cos(t_))}`, t: `θ = ${p5((t_ * 180) / Math.PI)}°` })
