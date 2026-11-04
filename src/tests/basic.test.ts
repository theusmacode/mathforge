import { describe, it, expect } from 'vitest'
import { gcd, lcm, factorize } from '../core/number-theory.ts'
import * as F from '../core/fraction.ts'
import { ruleOfThree } from '../core/proportion.ts'
import { solveLinear } from '../core/algebra.ts'
import { modules } from '../features/modules.ts'
const T = (x: F.Frac) => F.toText(x)

describe('frações', () => {
  it('1/2 + 1/3 = 5/6', () => expect(T(F.add(F.frac(1, 2), F.frac(1, 3)))).toBe('5/6'))
  it('normaliza sinais: (−3)/(−6)=1/2 e 4/(−8)=−1/2', () => { expect(T(F.frac(-3, -6))).toBe('1/2'); expect(T(F.frac(4, -8))).toBe('-1/2') })
  it('equivalentes: 2/4 e 50/100 viram 1/2', () => { expect(T(F.frac(2, 4))).toBe('1/2'); expect(T(F.frac(50, 100))).toBe('1/2') })
  it('1/2 − 1/2 = 0 (sem −0)', () => expect(T(F.sub(F.frac(1, 2), F.frac(1, 2)))).toBe('0'))
  it('2/3 × 3/4 = 1/2; 1/2 ÷ 3/4 = 2/3', () => { expect(T(F.mul(F.frac(2, 3), F.frac(3, 4)))).toBe('1/2'); expect(T(F.div(F.frac(1, 2), F.frac(3, 4)))).toBe('2/3') })
  it('0/5 = 0', () => expect(T(F.frac(0, 5))).toBe('0'))
  it('denominador zero e divisão por zero lançam erro', () => {
    let e1 = false, e2 = false
    try { F.frac(1, 0) } catch { e1 = true }
    try { F.div(F.frac(1, 2), F.frac(0, 5)) } catch { e2 = true }
    expect(e1).toBe(true); expect(e2).toBe(true)
  })
  it('rejeita não inteiros e overflow', () => {
    let a = false, b = false
    try { F.frac(1.5, 2) } catch { a = true }
    try { F.mul(F.frac(2 ** 40, 1), F.frac(2 ** 40, 1)) } catch { b = true }
    expect(a).toBe(true); expect(b).toBe(true)
  })
  it('módulo devolve erro para denominador zero', () => expect(modules.fracoes.compute({ n1: 1, d1: 0, n2: 1, d2: 2, op: 1 }).ok).toBe(false))
})
describe('MMC e MDC', () => {
  it('MDC(12,18)=6; MMC(4,6)=12', () => { expect(gcd(12, 18)).toBe(6); expect(lcm(4, 6)).toBe(12) })
  it('zeros e sinais: MMC(0,5)=0, MDC(0,5)=5, MDC(0,0)=0, MMC(−4,6)=12', () => {
    expect(lcm(0, 5)).toBe(0); expect(gcd(0, 5)).toBe(5); expect(gcd(0, 0)).toBe(0); expect(lcm(-4, 6)).toBe(12)
  })
  it('módulo rejeita decimais', () => expect(modules['mmc-mdc'].compute({ a: 1.5, b: 2 }).ok).toBe(false))
})
describe('fatoração', () => {
  const f = (n: number) => { const r = factorize(n); return r.ok ? r.factors.map(x => `${x.p}^${x.exp}`).join(',') : 'ERRO' }
  it('360 = 2^3·3^2·5', () => expect(f(360)).toBe('2^3,3^2,5^1'))
  it('primo 97 e primo grande 999999999989', () => { expect(f(97)).toBe('97^1'); expect(f(999999999989)).toBe('999999999989^1') })
  it('quadrado de primo: 49 = 7^2', () => expect(f(49)).toBe('7^2'))
  it('negativo: −12 = −1·2^2·3', () => { const r = factorize(-12); expect(r.ok && r.negative).toBe(true); expect(f(-12)).toBe('2^2,3^1') })
  it('1 sem fatores; 0, decimal e acima do limite são erros', () => { expect(f(1)).toBe(''); expect(f(0)).toBe('ERRO'); expect(f(2.5)).toBe('ERRO'); expect(f(1e13)).toBe('ERRO') })
})
describe('regra de três e equação do 1º grau', () => {
  it('direta: 2→10, 5→25', () => { const r = ruleOfThree(2, 10, 5, false); expect(r.ok && r.x).toBe(25) })
  it('inversa: 4 operários 6 dias, 8 operários → 3', () => { const r = ruleOfThree(4, 6, 8, true); expect(r.ok && r.x).toBe(3) })
  it('divisões por zero', () => { expect(ruleOfThree(0, 1, 1, false).ok).toBe(false); expect(ruleOfThree(1, 1, 0, true).ok).toBe(false) })
  it('2x+3=11 → 4', () => { const s = solveLinear(2, 3, 11); expect(s.kind).toBe('unique'); if (s.kind === 'unique') expect(s.x).toBe(4) })
  it('0x+3=3 infinitas; 0x+3=5 nenhuma', () => { expect(solveLinear(0, 3, 3).kind).toBe('all'); expect(solveLinear(0, 3, 5).kind).toBe('none') })
})
