import { describe, it, expect } from 'vitest'
import { parseData, describe as desc, percentile, frequencies } from '../core/stats.ts'
import { modules } from '../features/modules.ts'
const data = [2, 4, 4, 4, 5, 5, 7, 9]
describe('estatística descritiva', () => {
  const d = desc(data)
  it('média 5, mediana 4,5, moda 4, amplitude 7', () => { expect(d.mean).toBe(5); expect(d.median).toBe(4.5); expect(d.modes).toEqual([4]); expect(d.range).toBe(7) })
  it('variância e desvio: população 4 e 2; amostra 32/7', () => { expect(d.varPop).toBe(4); expect(d.sdPop).toBe(2); expect(d.varSample!).toBeCloseTo(32 / 7, 12); expect(d.sdSample!).toBeCloseTo(Math.sqrt(32 / 7), 12) })
  it('quartis (método inclusivo): Q1=4, Q3=5,5, IIQ=1,5', () => { expect(d.q1).toBe(4); expect(d.q3).toBe(5.5); expect(d.iqr).toBe(1.5) })
  it('percentis: P0=min, P100=max, P50=mediana, P90 interpolado', () => { expect(percentile(d.sorted, 0)).toBe(2); expect(percentile(d.sorted, 100)).toBe(9); expect(percentile(d.sorted, 50)).toBe(4.5); expect(percentile(d.sorted, 90)).toBeCloseTo(7.6, 12) })
  it('outliers pela regra 1,5·IIQ: 9 é atípico (limite 7,75)', () => expect(d.outliers).toEqual([9]))
  it('conjunto unitário: amostral indefinida, desvio populacional 0', () => { const u = desc([5]); expect(u.varSample).toBe(null); expect(u.sdPop).toBe(0); expect(u.median).toBe(5) })
  it('multimodal e amodal', () => { expect(desc([1, 1, 2, 2, 3]).modes).toEqual([1, 2]); expect(desc([1, 2, 3]).modes).toEqual([]) })
  it('negativos e decimais', () => { const x = desc([-1.5, 0.5, 1]); expect(x.mean).toBeCloseTo(0, 12); expect(x.median).toBe(0.5) })
  it('estabilidade: valores grandes com pequena dispersão', () => expect(desc([1e9 + 1, 1e9 + 2, 1e9 + 3]).varPop).toBeCloseTo(2 / 3, 6))
})
describe('entrada de dados', () => {
  it('separadores e vírgula decimal', () => { const p = parseData('1,5; 2\n3,25  4'); expect(p.ok && p.values).toEqual([1.5, 2, 3.25, 4]); const q = parseData('1, 2, 3'); expect(q.ok && q.values).toEqual([1, 2, 3]) })
  it('rejeita vazio, texto, hexadecimal e 1,2,3 colado', () => { for (const s of ['', '  ', 'a b', '0x10', '1,2,3', '1..2']) expect(parseData(s).ok).toBe(false) })
})
describe('frequências', () => {
  it('por valor: soma das frequências = n', () => { const f = frequencies(desc(data).sorted); expect(f.reduce((s, x) => s + x.count, 0)).toBe(8); expect(f.find(x => x.label === '4')!.count).toBe(3) })
  it('por classes quando há mais de 20 distintos; inclui o máximo', () => { const v = Array.from({ length: 100 }, (_, i) => i); const f = frequencies(v); expect(f.reduce((s, x) => s + x.count, 0)).toBe(100); expect(f.length).toBe(8) })
})
describe('módulo', () => {
  it('funciona e valida', () => {
    const r = modules['estatistica-descritiva'].compute({ p: undefined }, { dados: '2 4 4 4 5 5 7 9' }); expect(r.ok).toBe(true)
    expect(modules['estatistica-descritiva'].compute({}, { dados: 'x' }).ok).toBe(false)
    expect(modules['estatistica-descritiva'].compute({ p: 120 }, { dados: '1 2' }).ok).toBe(false)
  })
})
