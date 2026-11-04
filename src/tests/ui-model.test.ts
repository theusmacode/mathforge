import { describe, it, expect } from 'vitest'
import { tools } from '../registry/tool-registry.ts'
import { modules, customTools } from '../features/modules.ts'
import { kindOf, KINDS, exampleFor } from '../features/kinds.ts'
import { visualFor } from '../features/visuals.ts'
import { niceTicks } from '../core/ticks.ts'
const get = (id: string) => tools.find(t => t.id === id)!
describe('definição dos campos (regressão do bug do "|")', () => {
  it('todo campo tem id simples, rótulo sem "|" e as ferramentas de matriz leem campos de TEXTO', () => {
    for (const t of tools.filter(x => x.status === 'available' && !customTools.includes(x.id))) for (const f of modules[t.id].fields) {
      expect(/^[A-Za-z][A-Za-z0-9]*$/.test(f.id), `${t.id}.${f.id}`).toBe(true); expect(f.label.length > 0 && !f.label.includes('|'), `${t.id}.${f.id} rótulo`).toBe(true); expect(f.unit === undefined || !f.unit.includes('|'), `${t.id}.${f.id} unidade`).toBe(true) }
    for (const id of ['sistema-linear', 'regra-cramer']) { const f = modules[id].fields[0]; expect(f.text).toBe(true); expect(f.matrix).toBe('aug') }
    for (const id of ['matriz-soma', 'matriz-produto']) expect(modules[id].fields.filter(f => f.matrix === 'plain').length).toBe(2)
    expect(modules['teorema-bayes'].fields[1].unit).toBe(undefined)
  })
  it('exemplos existem para ferramentas de texto (botão "Usar exemplo")', () => { for (const id of ['derivada', 'tabela-verdade', 'estatistica-descritiva', 'correlacao-regressao']) expect(modules[id].fields.some(f => f.text && exampleFor(id, f.id) !== undefined)).toBe(true) })
})
describe('modelos de interface por finalidade', () => {
  it('mapeamento de exemplos', () => {
    expect(kindOf(get('desconto-acrescimo'))).toBe('calc'); expect(kindOf(get('tabela-price'))).toBe('finance'); expect(kindOf(get('matriz-inversa'))).toBe('matrix'); expect(kindOf(get('sistema-linear'))).toBe('matrix')
    expect(kindOf(get('estatistica-descritiva'))).toBe('stats'); expect(kindOf(get('derivada'))).toBe('analysis'); expect(kindOf(get('triangulo-ssa'))).toBe('geometry'); expect(kindOf(get('amplitude-periodo'))).toBe('geometry'); expect(kindOf(get('lei-ohm'))).toBe('physics'); expect(kindOf(get('tabela-verdade'))).toBe('algebra')
  })
  it('toda ferramenta tem um modelo válido e os 8 modelos são usados', () => { const used = new Set(tools.filter(t => !customTools.includes(t.id)).map(t => kindOf(t))); expect(used.size).toBe(8); for (const k of used) expect(KINDS[k].label.length > 0).toBe(true) })
})
describe('visuais calculados dos dados reais', () => {
  it('juros compostos 1000, 10%, 2 períodos: série termina em 1210', () => { const c = visualFor('juros-compostos', { c: 1000, i: 10, t: 2 }, {}).chart!; expect(c.kind).toBe('line'); if (c.kind === 'line') { const s = c.series[0].segs[0]; expect(s[0]).toEqual([0, 1000]); expect(s[s.length - 1][1]).toBeCloseTo(1210, 8) } })
  it('juros compostos com período fracionário inclui o ponto exato t', () => { const c = visualFor('juros-compostos', { c: 100, i: 10, t: 2.5 }, {}).chart!; if (c.kind === 'line') expect(c.series[0].segs[0].at(-1)![0]).toBe(2.5) })
  it('Price: saldo começa em PV e termina em 0; SAC idem', () => { for (const id of ['tabela-price', 'tabela-sac']) { const c = visualFor(id, { v: 1000, i: 1, n: 12 }, {}).chart!; if (c.kind === 'line') { const s = c.series[0].segs[0]; expect(s[0][1]).toBe(1000); expect(s.at(-1)![1]).toBe(0); expect(s.length).toBe(13) } } })
  it('aportes: o montante final bate com a fórmula fechada', () => { const c = visualFor('valor-futuro-aportes', { c: 0, p: 100, i: 1, n: 12, t: 0 }, {}).chart!; if (c.kind === 'line') expect(c.series[0].segs[0].at(-1)![1]).toBeCloseTo(1268.2503, 3) })
  it('desconto: comparação 200 → 170; acréscimo 200 → 220', () => { expect(visualFor('desconto-acrescimo', { v: 200, p: 15, m: 0 }, {}).compare).toEqual({ a: { label: 'Valor original', value: 200 }, b: { label: 'Com desconto', value: 170 }, unit: 'R$' }); expect(visualFor('desconto-acrescimo', { v: 200, p: 10, m: 1 }, {}).compare!.b.value).toBeCloseTo(220, 10) })
  it('histograma: soma das barras = n; dispersão traz a reta calculada', () => { const h = visualFor('estatistica-descritiva', {}, { dados: '2 4 4 4 5 5 7 9' }).chart!; if (h.kind === 'bars') expect(h.values.reduce((a, b) => a + b, 0)).toBe(8)
    const s = visualFor('correlacao-regressao', {}, { x: '1 2 3 4', y: '3 5 7 9' }).chart!; if (s.kind === 'scatter') { expect(s.fit![0]).toBeCloseTo(2, 12); expect(s.fit![1]).toBeCloseTo(1, 12); expect(s.pts.length).toBe(4) } })
  it('geometria: triângulo 3-4-5 e SSA ambíguo devolvem figura proporcional', () => { const t = visualFor('triangulo-sss', { a: 3, b: 4, c: 5 }, {}).chart!; if (t.kind === 'shape') { expect(t.shape).toBe('triangle'); expect(t.dims).toEqual({ a: 3, b: 4, c: 5 }) }; expect(visualFor('triangulo-ssa', { a: 5, b: 8, c: 30 }, {}).chart!.kind).toBe('shape'); expect(visualFor('triangulo-ssa', { a: 3, b: 8, c: 30 }, {}).chart).toBe(undefined) })
  it('cálculo: derivada marca o ponto; integral definida delimita a área; Newton marca a raiz', () => {
    const d = visualFor('derivada', { x0: 1, ord: 1 }, { f: 'x^2' }).chart!; if (d.kind === 'line') { expect(d.series.length).toBe(2); expect(d.marks![0][0]).toBe(1); expect(d.marks![0][1]).toBeCloseTo(1, 12) }
    const i = visualFor('integral-definida', { a: 0, b: 3 }, { f: 'x^2' }).chart!; if (i.kind === 'line') expect(i.area).toEqual([0, 3])
    const n = visualFor('raiz-newton', { x0: 1 }, { f: 'x^2-2' }).chart!; if (n.kind === 'line') expect(n.marks![0][0]).toBeCloseTo(Math.SQRT2, 9) })
  it('física: queda livre de 19,62 m dura 2 s e termina em altura 0', () => { const c = visualFor('queda-livre', { h: 19.62, g: undefined }, {}).chart!; if (c.kind === 'line') { const s = c.series[0].segs[0]; expect(s.at(-1)![0]).toBeCloseTo(2, 9); expect(s.at(-1)![1]).toBeCloseTo(0, 9) } })
  it('entradas inválidas nunca lançam exceção e não geram visual', () => { expect(visualFor('tabela-price', { v: -1, i: -1, n: 0 }, {})).toEqual({}); expect(visualFor('derivada', { x0: undefined, ord: 1 }, { f: 'alert(1)' })).toEqual({}); expect(visualFor('id-inexistente', {}, {})).toEqual({}); expect(visualFor('correlacao-regressao', {}, { x: '1 1 1', y: '1 2 3' })).toEqual({}) })
})
describe('marcas de eixo', () => { it('1–2–5 × 10ⁿ', () => { expect(niceTicks(0, 10)).toEqual([0, 2, 4, 6, 8, 10]); expect(niceTicks(-1, 1).includes(0)).toBe(true); expect(niceTicks(3, 3)).toEqual([3]) }) })
