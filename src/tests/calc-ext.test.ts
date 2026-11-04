import { describe, it, expect } from 'vitest'
import { evaluate } from '../core/expression.ts'
const v = (s: string, vars: Record<string, number> = {}) => { const r = evaluate(s, 'rad', vars); return r.ok ? r.value : NaN }
describe('extensões da calculadora', () => {
  it('hiperbólicas: sinh(0)=0, cosh(0)=1, tanh(0)=0; cosh²−sinh²=1', () => { expect(v('sinh(0)')).toBe(0); expect(v('cosh(0)')).toBe(1); expect(v('tanh(0)')).toBe(0); expect(v('cosh(1.3)^2-sinh(1.3)^2')).toBeCloseTo(1, 12) })
  it('porcentagem: 50% = 0,5; 200*10% = 20; (1+50%)*2 = 3', () => { expect(v('50%')).toBe(0.5); expect(v('200*10%')).toBeCloseTo(20, 12); expect(v('(1+50%)*2')).toBe(3) })
  it('% e ! combinados: 5!% = 1,2', () => expect(v('5!%')).toBeCloseTo(1.2, 12))
  it('ans como variável', () => { expect(v('ans*2+1', { ans: 4 })).toBe(9); expect(evaluate('ans*2').ok).toBe(false) })
  it('notação científica e constantes: 1E3+1 = 1001; 2*pi*e', () => { expect(v('1E3+1')).toBe(1001); expect(v('2*pi*e')).toBeCloseTo(2 * Math.PI * Math.E, 12) })
  it('log2(8)=3; cbrt(27)=3; abs(-4)=4; recíproco 1/(4)=0,25', () => { expect(v('log2(8)')).toBe(3); expect(v('cbrt(27)')).toBeCloseTo(3, 12); expect(v('abs(-4)')).toBe(4); expect(v('1/(4)')).toBe(0.25) })
  it('erros continuam sendo erros: % sozinho, 5%%x', () => { expect(evaluate('%').ok).toBe(false); expect(evaluate('5%x').ok).toBe(false) })
})
