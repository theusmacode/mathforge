import { describe, it, expect } from 'vitest'
import { tools } from '../registry/tool-registry.ts'
import { modules, customTools } from '../features/modules.ts'
import { SPECS } from '../features/ui/specs.ts'
const avail = tools.filter(t => t.status === 'available'), real = avail.filter(x => !customTools.includes(x.id))
describe('plano de interface de cada ferramenta', () => {
  it('as 127 ferramentas disponíveis têm especificação, e não há especificação órfã', () => { expect(avail.length >= 127).toBe(true); for (const t of avail) expect(SPECS[t.id], `sem spec: ${t.id}`).toBeDefined(); for (const id of Object.keys(SPECS)) expect(tools.some(t => t.id === id), `órfã: ${id}`).toBe(true) })
  it('interface própria = exatamente customTools', () => { for (const t of avail) expect(SPECS[t.id].layout === 'custom', t.id).toBe(customTools.includes(t.id)) })
  it('enunciados, editores e sliders só referenciam campos existentes do tipo certo', () => {
    for (const t of real) { const spec = SPECS[t.id], fs = modules[t.id].fields, ids = new Set(fs.map(f => f.id)), at = (id: string) => fs.find(f => f.id === id)!
      for (const m of (spec.sentence ?? '').matchAll(/\{(\w+)\}/g)) expect(ids.has(m[1]), `${t.id}: {${m[1]}}`).toBe(true)
      for (const [id, e] of Object.entries(spec.editors ?? {})) { expect(ids.has(id), `${t.id}.editor ${id}`).toBe(true); if (e.startsWith('pairs:')) expect(ids.has(e.slice(6)), `${t.id} par ${e}`).toBe(true); expect(at(id).text === true, `${t.id}.${id} editor exige texto`).toBe(true) }
      for (const id of Object.keys(spec.sliders ?? {})) { expect(ids.has(id)).toBe(true); expect(!at(id).text && !at(id).options, `${t.id}.${id} slider só em numérico`).toBe(true) }
      if (spec.layout === 'matrixop') expect(fs.every(f => f.matrix || !f.text), t.id).toBe(true)
      if (spec.layout !== 'matrixop') expect((spec.sentence ?? '').length > 0, `${t.id} sem enunciado`).toBe(true) }
  })
  it('todo campo de texto (não matriz) tem editor, é parceiro de pares ou aparece no enunciado', () => { for (const t of real) { const s = SPECS[t.id]; for (const f of modules[t.id].fields) if (f.text && !f.matrix) expect(!!s.editors?.[f.id] || Object.values(s.editors ?? {}).includes(`pairs:${f.id}`) || (s.sentence ?? '').includes(`{${f.id}}`), `${t.id}.${f.id}`).toBe(true) } })
  it('lógica → conectivos; cálculo → teclado de funções; polinômios → coeficientes; física → unidades', () => {
    for (const id of ['tabela-verdade', 'equivalencia-logica']) expect(Object.values(SPECS[id].editors!).every(e => e === 'ops')).toBe(true)
    for (const id of ['derivada', 'integral-indefinida', 'integral-definida', 'limite-numerico', 'raiz-newton']) expect(SPECS[id].editors!.f).toBe('expr')
    for (const id of ['polinomio-soma-sub', 'polinomio-produto', 'polinomio-divisao', 'polinomio-avaliacao', 'polinomio-fatoracao']) expect(SPECS[id].editors!.p).toBe('coeffs')
    for (const t of avail.filter(x => x.category === 'fisica')) expect(SPECS[t.id].units, t.id).toBe(true) })
})
