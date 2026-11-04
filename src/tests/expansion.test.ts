import { describe, it, expect } from 'vitest'
import { evaluate } from '../core/expression.ts'
import { sample, yRange, runs, findRoots } from '../core/plot.ts'
import * as S from '../core/science.ts'
import { modules } from '../features/modules.ts'
import { tools } from '../registry/tool-registry.ts'

describe('parser com variável x', () => {
  it('x^2 − 4 em x=3 → 5', () => { const r = evaluate('x^2-4', 'rad', { x: 3 }); expect(r.ok && r.value).toBe(5) })
  it('x não definida continua sendo erro; variáveis não vazam protótipo', () => { expect(evaluate('x').ok).toBe(false); expect(evaluate('x', 'rad', {}).ok).toBe(false); expect(evaluate('constructor', 'rad', { x: 1 }).ok).toBe(false) })
})
describe('gráficos', () => {
  it('amostra x^2 em [−2,2] com 4 intervalos', () => {
    const s = sample('x^2', -2, 2, 4, 'rad'); expect(s.ok).toBe(true)
    if (s.ok) expect(s.pts.map(p => p.y)).toEqual([4, 1, 0, 1, 4])
  })
  it('intervalo inválido e expressão inválida', () => { expect(sample('x', 2, 1, 10, 'rad').ok).toBe(false); expect(sample('x+', 0, 1, 10, 'rad').ok).toBe(false) })
  it('sqrt(x) em [−1,1] deixa lacuna (null) para x<0', () => {
    const s = sample('sqrt(x)', -1, 1, 10, 'rad'); if (s.ok) { expect(s.pts[0].y).toBe(null); expect(s.pts[10].y).toBe(1) }
  })
  it('tan(x) em [−4,4] é quebrada em ≥3 trechos (não liga as assíntotas)', () => {
    const s = sample('tan(x)', -4, 4, 800, 'rad'); if (!s.ok) throw new Error('falhou')
    const [lo, hi] = yRange([s.pts]); expect(runs(s.pts, lo, hi).length >= 3).toBe(true)
  })
  it('1/x em [−1,1] gera 2 trechos', () => {
    const s = sample('1/x', -1, 1, 200, 'rad'); if (!s.ok) throw new Error('falhou')
    const [lo, hi] = yRange([s.pts]); expect(runs(s.pts, lo, hi).length).toBe(2)
  })
  it('zeros de x^2−4 em [−5,5] são −2 e 2', () => {
    const r = findRoots('x^2-4', -5, 5, 400, 'rad'); expect(r.length).toBe(2); expect(r[0]).toBeCloseTo(-2, 8); expect(r[1]).toBeCloseTo(2, 8)
  })
  it('zeros de sin(x) em [−4,4] são −π, 0, π; tan não reporta polos', () => {
    const r = findRoots('sin(x)', -4, 4, 800, 'rad'); expect(r.length).toBe(3); expect(r[0]).toBeCloseTo(-Math.PI, 8); expect(r[2]).toBeCloseTo(Math.PI, 8)
    expect(findRoots('1/x', -1, 1, 200, 'rad').length).toBe(0)
  })
})
describe('geometria e trigonometria', () => {
  it('círculo r=1: C=2π, A=π', () => { const c = S.circle(1); expect(c.c).toBeCloseTo(2 * Math.PI, 12); expect(c.a).toBeCloseTo(Math.PI, 12) })
  it('esfera r=3: V=36π; cilindro r=2,h=5: V=20π', () => { expect(S.sphere(3).v).toBeCloseTo(36 * Math.PI, 10); expect(S.cylinder(2, 5).v).toBeCloseTo(20 * Math.PI, 10) })
  it('cone r=3,h=4: g=5, V=12π, Alat=15π', () => { const c = S.cone(3, 4); expect(c.g).toBeCloseTo(5, 12); expect(c.v).toBeCloseTo(12 * Math.PI, 10); expect(c.lat).toBeCloseTo(15 * Math.PI, 10) })
  it('cubo a=2: V=8, A=24, d=2√3', () => { const c = S.cube(2); expect(c.v).toBe(8); expect(c.a).toBe(24); expect(c.d).toBeCloseTo(2 * Math.sqrt(3), 12) })
  it('hexágono l=2: área = 6√3, soma=720, interno=120, diagonais=9', () => {
    const p = S.regularPolygon(6, 2); expect(p.area).toBeCloseTo(6 * Math.sqrt(3), 10); expect(p.angleSum).toBe(720); expect(p.interior).toBe(120); expect(p.diagonals).toBe(9)
  })
  it('quadrado via polígono regular l=3: área 9', () => expect(S.regularPolygon(4, 3).area).toBeCloseTo(9, 10))
  it('trig: 30°, 90° (tan indefinida), 180° (sen=0)', () => {
    expect(S.trigRatios(Math.PI / 6).sin).toBeCloseTo(0.5, 12); expect(S.trigRatios(Math.PI / 2).tan).toBe(null); expect(S.trigRatios(Math.PI).sin).toBe(0)
  })
  it('módulos rejeitam medidas não positivas e n<3', () => {
    expect(modules.esfera.compute({ r: 0 }).ok).toBe(false); expect(modules.cone.compute({ r: 1, h: -1 }).ok).toBe(false); expect(modules['poligono-regular'].compute({ n: 2, l: 1 }).ok).toBe(false)
  })
})
describe('funções afim e quadrática (módulos)', () => {
  it('quadrática x²−4x+3: vértice (2,−1), raízes 1 e 3', () => {
    const r = modules['funcao-quadratica'].compute({ a: 1, b: -4, c: 3 }); expect(r.ok).toBe(true)
    if (r.ok) { expect(r.outputs.find(o => o.label === 'Vértice')?.value).toBe('(2, -1)'); expect(r.outputs.find(o => o.label === 'Raízes reais')?.value).toBe('1 e 3') }
  })
  it('quadrática com a=0 é erro; afim 2x−6 tem raiz 3', () => {
    expect(modules['funcao-quadratica'].compute({ a: 0, b: 1, c: 1 }).ok).toBe(false)
    const r = modules['funcao-afim'].compute({ a: 2, b: -6 }); if (r.ok) expect(r.outputs[0].value).toBe('3')
  })
})
describe('combinatória e física', () => {
  it('C(5,2)=10, A(5,2)=20, P(5)=120', () => { const r = S.combinatorics(5, 2); if (r.ok) { expect(Number(r.combination)).toBe(10); expect(Number(r.arrangement)).toBe(20); expect(Number(r.permutation)).toBe(120) } })
  it('exatidão grande: C(100,50) = 100891344545564193334812497256', () => { const r = S.combinatorics(100, 50); expect(r.ok && r.combination.toString()).toBe('100891344545564193334812497256') })
  it('k=0 e k=n; entradas inválidas', () => { const a = S.combinatorics(7, 0); expect(a.ok && Number(a.combination)).toBe(1); expect(S.combinatorics(3, 5).ok).toBe(false); expect(S.combinatorics(201, 1).ok).toBe(false); expect(S.combinatorics(2.5, 1).ok).toBe(false) })
  it('Newton: 2 kg · 3 m/s² = 6 N; massa negativa é erro', () => { const r = modules['segunda-lei-newton'].compute({ m: 2, a: 3 }); if (r.ok) expect(r.outputs[0].value).toBe('6 N'); expect(modules['segunda-lei-newton'].compute({ m: -1, a: 1 }).ok).toBe(false) })
  it('Ec: 2 kg a 3 m/s = 9 J', () => { const r = modules['energia-cinetica'].compute({ m: 2, v: 3 }); if (r.ok) expect(r.outputs[0].value).toBe('9 J') })
  it('Ohm: 12 V e 4 Ω → 3 A; 12 V e 0 A → erro; três valores → erro', () => {
    const r = modules['lei-ohm'].compute({ V: 12, R: 4 }); if (r.ok) expect(r.outputs[0].value).toBe('3 A')
    expect(modules['lei-ohm'].compute({ V: 12, I: 0 }).ok).toBe(false); expect(modules['lei-ohm'].compute({ V: 1, I: 1, R: 1 }).ok).toBe(false)
  })
})
describe('registro', () => {
  it('toda ferramenta disponível tem módulo ou componente; ids únicos', () => { expect(new Set(tools.map(t => t.id)).size).toBe(tools.length) })
})
