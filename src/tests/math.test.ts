import { describe, it, expect } from 'vitest'
import { simpleInterest, compoundInterest } from '../core/finance.ts'
import { solveQuadratic } from '../core/algebra.ts'
import { pythagoras } from '../core/geometry.ts'
import { modules } from '../features/modules.ts'

describe('juros', () => {
  it('simples: 1000 a 5% por 3 períodos = 150 de juros', () => {
    const r = simpleInterest(1000, 5, 3); expect(r.juros).toBeCloseTo(150, 10); expect(r.montante).toBeCloseTo(1150, 10)
  })
  it('compostos: 1000 a 10% por 2 = 1210', () => { expect(compoundInterest(1000, 10, 2).montante).toBeCloseTo(1210, 8) })
  it('taxa zero e período zero mantêm o capital', () => {
    expect(compoundInterest(500, 0, 12).montante).toBe(500); expect(compoundInterest(500, 7, 0).montante).toBe(500)
    expect(simpleInterest(500, 0, 12).juros).toBe(0); expect(simpleInterest(500, 7, 0).juros).toBe(0)
  })
  it('rejeita capital negativo', () => { expect(modules['juros-compostos'].compute({ c: -1, i: 1, t: 1 }).ok).toBe(false) })
})
describe('equação do 2º grau', () => {
  it('Δ>0: x²−5x+6 → 2 e 3', () => {
    const s = solveQuadratic(1, -5, 6); expect(s.kind).toBe('two-real')
    if (s.kind === 'two-real') { expect(s.x1).toBeCloseTo(2, 10); expect(s.x2).toBeCloseTo(3, 10); expect(s.delta).toBe(1) }
  })
  it('Δ=0: x²−2x+1 → 1', () => { const s = solveQuadratic(1, -2, 1); expect(s.kind).toBe('one-real'); if (s.kind === 'one-real') expect(s.x).toBe(1) })
  it('Δ<0: x²+1 → ±i', () => { const s = solveQuadratic(1, 0, 1); expect(s.kind).toBe('complex'); if (s.kind === 'complex') { expect(s.re).toBe(0); expect(s.im).toBe(1) } })
  it('a=0 vira 1º grau: 2x−4=0 → 2', () => { const s = solveQuadratic(0, 2, -4); expect(s.kind).toBe('linear'); if (s.kind === 'linear') expect(s.x).toBe(2) })
  it('degenerados', () => { expect(solveQuadratic(0, 0, 0).kind).toBe('all-reals'); expect(solveQuadratic(0, 0, 3).kind).toBe('no-solution') })
  it('raízes grandes sem cancelamento: x²−1e8x+1', () => {
    const s = solveQuadratic(1, -1e8, 1); if (s.kind === 'two-real') expect(s.x1).toBeCloseTo(1e-8, 15)
  })
})
describe('pitágoras', () => {
  it('3,4 → 5', () => { const r = pythagoras(3, 4, undefined); expect(r.ok && r.c).toBe(5) })
  it('hipotenusa 5, cateto 3 → 4', () => { const r = pythagoras(3, undefined, 5); expect(r.ok && r.b).toBeCloseTo(4, 12) })
  it('hipotenusa menor que cateto é inválida', () => { expect(pythagoras(6, undefined, 5).ok).toBe(false) })
  it('exige exatamente dois valores', () => { expect(pythagoras(3, undefined, undefined).ok).toBe(false); expect(pythagoras(3, 4, 5).ok).toBe(false) })
  it('rejeita lados não positivos', () => { expect(pythagoras(0, 4, undefined).ok).toBe(false) })
})
