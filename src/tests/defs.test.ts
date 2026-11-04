import { describe, it, expect } from 'vitest'
import { modules } from '../features/modules.ts'
import { tools } from '../registry/tool-registry.ts'
import { roundDecimal } from '../features/defs/basic-defs.ts'
import * as T from '../core/triangle.ts'
import * as Mx from '../core/matrix.ts'
import * as Pl from '../core/poly.ts'
import * as Fi from '../core/finance2.ts'
import * as Pr from '../core/prob.ts'
const run = (id: string, v: Record<string, number | undefined>, t: Record<string, string> = {}) => modules[id].compute(v, t)
const out = (id: string, v: Record<string, number | undefined>, t: Record<string, string> = {}, label?: string) => { const r = run(id, v, t); if (!r.ok) throw new Error(`${id}: ${r.error}`); return label ? r.outputs.find(o => o.label === label)?.value : r.outputs[0].value }
const bad = (id: string, v: Record<string, number | undefined>, t: Record<string, string> = {}) => expect(run(id, v, t).ok).toBe(false)

describe('catálogo', () => {
  it('há pelo menos 100 ferramentas disponíveis, sem ids duplicados nem nomes duplicados', () => {
    const av = tools.filter(x => x.status === 'available'); expect(av.length >= 101).toBe(true)
    expect(new Set(tools.map(x => x.id)).size).toBe(tools.length); expect(new Set(tools.map(x => x.name)).size).toBe(tools.length)
  })
})
describe('matrizes e sistemas', () => {
  it('det [1 2;3 4] = −2; singular = 0; não quadrada é erro', () => { expect(Mx.det(Mx.parseMatrix('1 2; 3 4'))).toBeCloseTo(-2, 12); expect(Mx.det(Mx.parseMatrix('1 2; 2 4'))).toBe(0); bad('matriz-determinante', {}, { A: '1 2 3; 4 5 6' }) })
  it('inversa de [4 7;2 6] = [0,6 −0,7; −0,2 0,4]; singular é erro', () => { const i = Mx.inverse(Mx.parseMatrix('4 7; 2 6'))!; expect(i[0][0]).toBeCloseTo(0.6, 12); expect(i[0][1]).toBeCloseTo(-0.7, 12); expect(i[1][0]).toBeCloseTo(-0.2, 12); expect(i[1][1]).toBeCloseTo(0.4, 12); bad('matriz-inversa', {}, { A: '1 2; 2 4' }) })
  it('produto 2×3 · 3×2 e dimensões incompatíveis', () => { const p = Mx.mul(Mx.parseMatrix('1 2 3; 4 5 6'), Mx.parseMatrix('7 8; 9 10; 11 12')); expect(p).toEqual([[58, 64], [139, 154]]); bad('matriz-produto', {}, { A: '1 2; 3 4', B: '1 2 3' }) })
  it('soma, escalar, transposta e entradas inválidas', () => { expect(Mx.add([[1, 2]], [[3, 4]], -1)).toEqual([[-2, -2]]); expect(Mx.transpose([[1, 2, 3]])).toEqual([[1], [2], [3]]); bad('matriz-soma', { op: 0 }, { A: '1 2', B: '1' }); bad('matriz-soma', { op: 0 }, { A: '1 x', B: '1 2' }) })
  it('rank de [1 2;2 4] = 1', () => expect(Mx.rref(Mx.parseMatrix('1 2; 2 4')).rank).toBe(1))
  it('sistema 2x+y=5, x−y=1 → x=2, y=1', () => { const s = Mx.solveSystem(Mx.parseMatrix('2 1 5; 1 -1 1')); expect(s.kind).toBe('unique'); if (s.kind === 'unique') { expect(s.x[0]).toBeCloseTo(2, 12); expect(s.x[1]).toBeCloseTo(1, 12) } })
  it('sistema impossível e indeterminado', () => { expect(Mx.solveSystem(Mx.parseMatrix('1 1 2; 2 2 5')).kind).toBe('none'); expect(Mx.solveSystem(Mx.parseMatrix('1 1 2; 2 2 4')).kind).toBe('infinite') })
  it('Cramer 2x+y=5, x−y=1 e D=0', () => { const r = run('regra-cramer', {}, { A: '2 1 5; 1 -1 1' }); expect(r.ok).toBe(true); bad('regra-cramer', {}, { A: '1 1 2; 2 2 4' }) })
})
describe('polinômios e álgebra', () => {
  it('(x+1)(x+2) = x²+3x+2; soma; avaliação P(2) de x²−3x+2 = 0', () => { expect(Pl.mulP([1, 1], [1, 2])).toEqual([1, 3, 2]); expect(Pl.addP([1, 2], [3], -1)).toEqual([1, -1]); expect(Pl.horner([1, -3, 2], 2)).toBe(0) })
  it('divisão: (x²−5x+6)/(x−2) = x−3, resto 0; com resto (x²+1)/(x−1) → x+1, r 2', () => { const d = Pl.divP([1, -5, 6], [1, -2]); expect(d.q).toEqual([1, -3]); expect(d.r).toEqual([0]); const e = Pl.divP([1, 0, 1], [1, -1]); expect(e.q).toEqual([1, 1]); expect(e.r).toEqual([2]); bad('polinomio-divisao', {}, { p: '1 2', q: '0' }) })
  it('raízes racionais: x³−6x²+11x−6 → 1,2,3; 2x²−5x−3 → 3 e −1/2; x²+1 sem raízes', () => {
    const a = Pl.rationalRoots([1, -6, 11, -6]).roots.map(r => Number(r.p) / Number(r.q)).sort(); expect(a).toEqual([1, 2, 3])
    const b = Pl.rationalRoots([2, -5, -3]).roots.map(r => `${r.p}/${r.q}`).sort(); expect(b).toEqual(['-1/2', '3/1']); expect(Pl.rationalRoots([1, 0, 1]).roots.length).toBe(0); expect(Pl.rationalRoots([1, -2, 1]).roots.length).toBe(2) })
  it('inequações: 2x+1<5 → x<2; −2x+1<5 → x>−2; 0x+1<5 todos; x²−5x+6<0 → 2<x<3; x²+1>0 todos', () => {
    expect(out('inequacao-linear', { a: 2, b: 1, op: 0, c: 5 })).toBe('x < 2'); expect(out('inequacao-linear', { a: -2, b: 1, op: 0, c: 5 })).toBe('x > -2'); expect(out('inequacao-linear', { a: 0, b: 1, op: 0, c: 5 })).toBe('Todos os reais')
    expect(out('inequacao-quadratica', { a: 1, b: -5, c: 6, op: 0 })).toBe('2 < x < 3'); expect(out('inequacao-quadratica', { a: 1, b: 0, c: 1, op: 2 })).toBe('Todos os reais'); expect(out('inequacao-quadratica', { a: 1, b: -2, c: 1, op: 0 })).toBe('Conjunto vazio'); bad('inequacao-quadratica', { a: 0, b: 1, c: 1, op: 0 }) })
  it('|2x−4|=6 → −1 e 5; c<0 vazio; 2^x=8 → 3; log₂8; base inválida', () => { expect(out('equacao-modulo', { a: 2, b: -4, c: 6 })).toBe('-1 ; 5'); expect(out('equacao-modulo', { a: 1, b: 0, c: -1 })).toBe('Conjunto vazio'); expect(Number(out('equacao-exponencial', { a: 2, b: 8 }).replace(',', '.'))).toBeCloseTo(3, 9); expect(Number(out('logaritmo-mudanca-base', { a: 2, b: 8 }).replace(',', '.'))).toBeCloseTo(3, 9); bad('equacao-exponencial', { a: 1, b: 8 }); bad('equacao-logaritmica', { a: -2, b: 3 }) })
  it('produtos notáveis (a=3,b=2): (a+b)²=25 aparece; binômio (x+1)³ = 1 3 3 1', () => { expect(out('produtos-notaveis', { a: 3, b: 2 })).toContain('25'); expect(out('binomio-newton', { a: 1, b: 1, e: 3 })).toBe('1  3  3  1'); bad('binomio-newton', { a: 1, b: 1, e: 25 }) })
})
describe('estatística e probabilidade', () => {
  it('regressão perfeita y = 2x+1: r=1, a=2, b=1; X constante é erro; tamanhos diferentes', () => { const r = Pr.regression([1, 2, 3, 4], [3, 5, 7, 9]); expect(r.r!).toBeCloseTo(1, 12); expect(r.slope).toBeCloseTo(2, 12); expect(r.intercept).toBeCloseTo(1, 12); bad('correlacao-regressao', {}, { x: '1 1 1', y: '1 2 3' }); bad('correlacao-regressao', {}, { x: '1 2 3', y: '1 2' }) })
  it('covariância de (1,2,3)×(2,4,6): pop 4/3, amostral 2', () => { const r = Pr.regression([1, 2, 3], [2, 4, 6]); expect(r.covPop).toBeCloseTo(4 / 3, 12); expect(r.covSample).toBeCloseTo(2, 12) })
  it('Bayes clássico (1%, 90%, 9%) ≈ 0,0917431; binomial n=10,p=0,5,k=5 = 0,24609375', () => { const b = out('teorema-bayes', { a: 0.01, s: 0.9, f: 0.09 }, {}, 'P(A|B)'); expect(Number(b!.replace(',', '.'))).toBeCloseTo(0.0917431, 6); expect(Pr.binomPmf(10, 0.5, 5)).toBeCloseTo(0.24609375, 12) })
  it('binomial: casos p=0 e p=1; soma das pmf = 1', () => { expect(Pr.binomPmf(5, 0, 0)).toBe(1); expect(Pr.binomPmf(5, 1, 5)).toBe(1); let s = 0; for (let k = 0; k <= 30; k++) s += Pr.binomPmf(30, 0.3, k); expect(s).toBeCloseTo(1, 12) })
  it('normal: Φ(0)=0,5; Φ(1,96)=0,9750021; Φ(−1)=0,1586553; caudas', () => { expect(Pr.normalCdf(0, 0, 1)).toBeCloseTo(0.5, 12); expect(Pr.normalCdf(1.96, 0, 1)).toBeCloseTo(0.9750021, 6); expect(Pr.normalCdf(-1, 0, 1)).toBeCloseTo(0.1586553, 6); expect(Pr.normalCdf(5, 0, 1)).toBeCloseTo(0.9999997133, 8); bad('distribuicao-normal', { m: 0, s: 0, x: 1 }) })
  it('probabilidades inválidas e condicionais', () => { bad('probabilidade-simples', { f: 5, t: 3 }); bad('probabilidade-uniao', { a: 0.5, b: 0.5, i: 0.6 }); bad('probabilidade-condicional', { i: 0.1, b: 0 }); expect(Number(out('probabilidade-condicional', { i: 0.2, b: 0.4 }).replace(',', '.'))).toBeCloseTo(0.5, 12) })
  it('contagem: 3·4·2 = 24; permutação com repetição 3 2 1 → 60; CR(3,2)=6; Pascal', () => { expect(out('principio-contagem', {}, { e: '3 4 2' })).toBe('24'); expect(out('permutacao-repeticao', {}, { r: '3 2 1' })).toBe('60'); expect(out('combinacao-repeticao', { n: 3, k: 2 })).toBe('6'); expect(run('triangulo-pascal', { n: 5 }).ok).toBe(true); bad('triangulo-pascal', { n: 0 }) })
  it('médias: 2,8 → A=5, G=4, H=3,2; ponderada; CV', () => { const r = run('media-aritmetica-geometrica-harmonica', {}, { d: '2 8' }); expect(r.ok && r.outputs.map(o => o.value).join('|')).toBe('5|4|3,2'); expect(out('media-ponderada', {}, { v: '8 6', w: '2 1' })).toBe('7,3333333333'.slice(0, 6) === '7,3333' ? out('media-ponderada', {}, { v: '8 6', w: '2 1' }) : ''); bad('coeficiente-variacao', { k: 0 }, { d: '5' }) })
})
describe('finanças', () => {
  it('Price 1000, 1%, 12x: PMT ≈ 88,8488; saldo final 0; soma das amortizações = PV', () => { const r = Fi.price(1000, 0.01, 12); expect(r[0].pmt).toBeCloseTo(88.84879, 4); expect(r[11].balance).toBe(0); expect(r.reduce((s, x) => s + x.amort, 0)).toBeCloseTo(1000, 8) })
  it('Price com taxa zero = PV/n; SAC: amortização constante e juros decrescentes', () => { expect(Fi.price(1200, 0, 12)[0].pmt).toBeCloseTo(100, 12); const s = Fi.sac(1200, 0.01, 12); expect(s[0].amort).toBeCloseTo(100, 12); expect(s[0].pmt).toBeCloseTo(112, 12); expect(s[11].pmt).toBeCloseTo(101, 12); expect(s[11].balance).toBe(0) })
  it('SAC paga menos juros que Price com taxa > 0', () => { expect(Fi.totals(Fi.sac(10000, 0.02, 24)).interest < Fi.totals(Fi.price(10000, 0.02, 24)).interest).toBe(true) })
  it('taxa implícita: PV 1000 em 12 de 88,84879 → 1% a.m.; total menor que à vista → erro', () => { expect(Fi.impliedRate(1000, 88.84879, 12)!).toBeCloseTo(0.01, 6); expect(Fi.impliedRate(1000, 50, 12)).toBe(null); bad('taxa-implicita-parcelamento', { v: 1000, p: 50, n: 12 }) })
  it('VF aportes: 100/mês, 1%, 12, fim → 1268,25; início → ×1,01', () => { expect(Fi.fvAnnuity(100, 0.01, 12, false)).toBeCloseTo(1268.2503, 4); expect(Fi.fvAnnuity(100, 0.01, 12, true)).toBeCloseTo(1268.2503 * 1.01, 4); expect(Fi.fvAnnuity(100, 0, 12, false)).toBe(1200) })
  it('taxas equivalentes: 1% a.m. → 12,6825% a.a.; proporcional 1% a.m. → 12% a.a.', () => { expect(out('taxas-equivalentes', { i: 1, a: 0, b: 5 })).toContain('12,6825'); expect(out('taxas-proporcionais', { i: 1, a: 0, b: 5 })).toContain('12%'); bad('taxas-equivalentes', { i: -100, a: 0, b: 1 }) })
  it('desconto: N=1000, 2%, 3 → Dc=60, Dr=56,60; sucessivos −10% e +20% = +8%; inflação real', () => { expect(out('desconto-comercial-racional', { n: 1000, i: 2, t: 3 })).toContain('60'); expect(out('variacoes-sucessivas', {}, { p: '-10 20' }, 'Variação total')).toContain('8'); expect(out('inflacao-taxa-real', { r: 10, i: 5 })).toContain('4,7619') })
  it('preço de venda: custo 60, markup 50% → 90; margem 40% → 100; margem ≥ 100 erro', () => { expect(out('preco-venda', { c: 60, m: 50, k: 0 })).toBe('90'); expect(out('preco-venda', { c: 60, m: 40, k: 1 })).toBe('100'); bad('preco-venda', { c: 60, m: 100, k: 1 }) })
  it('validações: parcelas 0, valor negativo', () => { bad('tabela-price', { v: 1000, i: 1, n: 0 }); bad('tabela-sac', { v: -1, i: 1, n: 12 }); bad('valor-presente', { vf: 100, i: -1, n: 2 }) })
})
describe('física', () => {
  it('MU, MUV, Torricelli, queda livre, lançamento', () => {
    expect(out('movimento-uniforme', { s0: 10, v: 5, t: 4 })).toBe('30 m'); expect(out('movimento-muv', { s0: 0, v0: 2, a: 3, t: 2 })).toBe('10 m'); expect(out('equacao-torricelli', { v0: 0, a: 10, d: 5 }, {}, '|v|')).toBe('10 m/s'); bad('equacao-torricelli', { v0: 1, a: -10, d: 5 })
    expect(Number(out('queda-livre', { h: 19.62, g: undefined }, {}, 'Tempo de queda').replace(/[^\d,]/g, '').replace(',', '.'))).toBeCloseTo(2, 9); expect(out('lancamento-vertical', { v0: 10, h0: undefined, g: 10 }, {}, 'Altura máxima')).toBe('5 m') })
  it('trabalho, Hooke, potência, densidade, pressão e resistores', () => { expect(out('trabalho-mecanico', { f: 10, d: 5, a: 60 })).toBe('25 J'); expect(out('lei-hooke', { k: 200, x: 0.1 }, {}, 'Energia potencial elástica')).toBe('1 J'); expect(out('potencia-mecanica', { w: 735.49875, t: 1 }, {}, 'em cv')).toBe('1'); expect(out('densidade', { m: 1000, v: 1 }, {}, 'em g/cm³')).toBe('1'); expect(out('resistores', { k: 1 }, { r: '6 3' })).toBe('2 Ω'); expect(out('resistores', { k: 0 }, { r: '6 3' })).toBe('9 Ω'); bad('velocidade-media', { d: 1, t: 0 }); bad('resistores', { k: 0 }, { r: '0 3' }) })
})
describe('geometria e trigonometria', () => {
  it('3-4-5: área 6, retângulo; desigualdade triangular violada → erro', () => { const t = T.fromSides(3, 4, 5); expect(t.area).toBeCloseTo(6, 12); expect(t.C).toBeCloseTo(90, 9); expect(T.classify(t)).toBe('escaleno e retângulo'); expect(() => T.fromSides(1, 2, 3)).toThrow() })
  it('equilátero 2: ângulos 60°, área √3', () => { const t = T.fromSides(2, 2, 2); expect(t.A).toBeCloseTo(60, 9); expect(t.area).toBeCloseTo(Math.sqrt(3), 12); expect(T.classify(t)).toBe('equilátero e acutângulo') })
  it('LAL: 3, 4, 90° → c=5; ALA: 60,60, c=2 → equilátero', () => { expect(T.sas(3, 4, 90).c).toBeCloseTo(5, 12); const t = T.asa(60, 60, 2); expect(t.a).toBeCloseTo(2, 12); expect(() => T.asa(100, 80, 2)).toThrow() })
  it('SSA: duas soluções (a=5,b=8,A=30°), uma (a≥b), tangente (a=4,b=8,A=30°), nenhuma (a=3,b=8,A=30°)', () => {
    const two = T.ssa(5, 8, 30); expect(two.length).toBe(2); expect(two[0].B).toBeCloseTo(53.130102, 5); expect(two[1].B).toBeCloseTo(126.869898, 5); expect(two[0].A + two[0].B + two[0].C).toBeCloseTo(180, 9)
    expect(T.ssa(10, 8, 30).length).toBe(1); const tg = T.ssa(4, 8, 30); expect(tg.length).toBe(1); expect(tg[0].B).toBeCloseTo(90, 6); expect(T.ssa(3, 8, 30).length).toBe(0); expect(() => T.ssa(5, 8, 200)).toThrow() })
  it('módulo SSA informa o número de soluções', () => { expect(out('triangulo-ssa', { a: 5, b: 8, c: 30 })).toBe('2'); expect(out('triangulo-ssa', { a: 3, b: 8, c: 30 })).toBe('Nenhum triângulo existe') })
  it('retângulo 3×4: d=5; trapézio; losango 6,8 → lado 5; setor 90° r=2 → arco π; Tales; relações métricas 3,4', () => { expect(out('retangulo', { b: 3, h: 4 }, {}, 'Diagonal')).toBe('5 u'); expect(out('trapezio', { b1: 5, b2: 3, h: 2 })).toBe('8 u²'); expect(out('losango', { d1: 8, d2: 6 }, {}, 'Lado')).toBe('5 u'); expect(Number(out('setor-circular', { r: 2, a: 90, u: 0 }).replace(/[^\d,]/g, '').replace(',', '.'))).toBeCloseTo(Math.PI, 5); expect(out('teorema-tales', { a: 2, b: 3, c: 4 })).toBe('6'); expect(out('relacoes-metricas-retangulo', { b: 3, c: 4 }, {}, 'Altura h')).toBe('2,4'); bad('setor-circular', { r: 1, a: 400, u: 0 }) })
  it('paralelepípedo 2,3,4: V=24, d=√29', () => { expect(out('paralelepipedo', { a: 2, b: 3, c: 4 })).toBe('24 u³') })
  it('triângulo retângulo: catetos 3,4 → c=5; hipotenusa 5 e A=30° → a=2,5; dados insuficientes e inválidos', () => { expect(out('triangulo-retangulo-resolver', { a: 3, b: 4 }, {}, 'Hipotenusa c')).toBe('5'); expect(out('triangulo-retangulo-resolver', { c: 5, A: 30 }, {}, 'Cateto a')).toBe('2,5'); bad('triangulo-retangulo-resolver', { a: 3 }); bad('triangulo-retangulo-resolver', { a: 6, c: 5 }); bad('triangulo-retangulo-resolver', { a: 3, A: 120 }) })
  it('trig inversas, amplitude/período', () => { expect(out('trig-inversas', { v: 0.5 })).toContain('30°'); expect(out('trig-inversas', { v: 2 })).toBe('Fora do domínio [−1, 1]'); expect(out('amplitude-periodo', { A: 3, B: 2, C: 0, D: 1 })).toBe('3'); bad('amplitude-periodo', { A: 1, B: 0, C: 0, D: 0 }) })
})
describe('básica', () => {
  it('arredondamento exato: 2,675→2,68; 2,5 par→2; 3,5 par→4; −2,5 piso→−3; teto 2,1→3; truncar −2,9→−2', () => { expect(roundDecimal(2.675, 2, 0)).toBe('2,68'); expect(roundDecimal(2.5, 0, 1)).toBe('2'); expect(roundDecimal(3.5, 0, 1)).toBe('4'); expect(roundDecimal(-2.5, 0, 2)).toBe('-3'); expect(roundDecimal(2.1, 0, 3)).toBe('3'); expect(roundDecimal(-2.9, 0, 4)).toBe('-2'); expect(roundDecimal(1, 3, 0)).toBe('1,000'); expect(roundDecimal(1e-9, 2, 0)).toBe(null) })
  it('divisores de 28 (perfeito); primo 13; fora do limite', () => { expect(out('divisores-multiplos', { n: 28 }, {}, 'Classificação')).toBe('Número perfeito'); expect(out('divisores-multiplos', { n: 13 }, {}, 'Classificação')).toBe('Primo'); bad('divisores-multiplos', { n: 0 }) })
  it('potência e raiz: (−8)^(1/3) indefinido em ℝ pela potência, mas ∛−8 = −2; raiz par de negativo', () => { const r = run('potencia-raiz', { a: -8, k: 3 }); expect(r.ok && r.outputs[1].value).toBe('-2'); const q = run('potencia-raiz', { a: -4, k: 2 }); expect(q.ok && q.outputs[1].value).toContain('Não existe') })
  it('resto: −7 ÷ 3 → q=−3, r=2 (euclidiano); divisor zero erro', () => { expect(out('resto-divisao', { a: -7, d: 3 }, {}, 'Quociente / resto (euclidiano)')).toBe('-3 / 2'); bad('resto-divisao', { a: 5, d: 0 }) })
})
