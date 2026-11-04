import { describe, it, expect } from 'vitest'
import { evaluate } from '../core/expression.ts'
const v = (s: string, m: 'deg' | 'rad' = 'rad') => { const r = evaluate(s, m); return r.ok ? r.value : NaN }
const bad = (s: string) => expect(evaluate(s).ok).toBe(false)

describe('precedência e operadores', () => {
  it('2+3*4=14', () => expect(v('2+3*4')).toBe(14))
  it('(2+3)*4=20', () => expect(v('(2+3)*4')).toBe(20))
  it('-2^2=-4', () => expect(v('-2^2')).toBe(-4))
  it('2^3^2=512 (associa à direita)', () => expect(v('2^3^2')).toBe(512))
  it('2^-1=0.5', () => expect(v('2^-1')).toBe(0.5))
  it('10-2-3=5 (associa à esquerda)', () => expect(v('10-2-3')).toBe(5))
  it('vírgula decimal e notação científica', () => { expect(v('1,5*2')).toBe(3); expect(v('1e3+1')).toBe(1001) })
})
describe('funções', () => {
  it('sqrt(16)=4', () => expect(v('sqrt(16)')).toBe(4))
  it('5!=120', () => expect(v('5!')).toBe(120))
  it('sin(90) em graus = 1; sin(180) = 0', () => { expect(v('sin(90)', 'deg')).toBeCloseTo(1, 12); expect(v('sin(180)', 'deg')).toBe(0) })
  it('sin(pi/2) em rad = 1', () => expect(v('sin(pi/2)')).toBeCloseTo(1, 12))
  it('asin(1) em graus = 90', () => expect(v('asin(1)', 'deg')).toBeCloseTo(90, 10))
  it('ln(e)=1, log(1000)=3', () => { expect(v('ln(e)')).toBeCloseTo(1, 12); expect(v('log(1000)')).toBeCloseTo(3, 12) })
})
describe('erros e segurança', () => {
  it('divisão por zero', () => bad('1/0'))
  it('domínio inválido', () => { bad('sqrt(-1)'); bad('ln(0)'); bad('asin(2)'); bad('(-1)!'); bad('2.5!'); bad('tan(90)'.replace('tan(90)', 'tan(pi/2)')) })
  it('sintaxe malformada', () => { bad('2+'); bad('2 +* 3'); bad('(1+2'); bad('1+2)'); bad(''); bad('2 3') })
  it('rejeita código e identificadores desconhecidos', () => {
    bad('alert(1)'); bad('constructor'); bad('__proto__'); bad('toString(1)'); bad('process.exit()'); bad('a=1'); bad('"x"'); bad('[1]')
  })
  it('limita o tamanho e overflow', () => { bad('1+'.repeat(150) + '1'); bad('171!'); bad('10^400') })
})
