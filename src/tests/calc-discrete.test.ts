import { describe, it, expect } from 'vitest'
import * as C from '../core/calculus.ts'
import * as D from '../core/discrete.ts'
const p = C.parse, ev = (s: string, x: number) => C.evalNode(p(s), x)
describe('derivada simbólica (verificada contra diferença central)', () => {
  const cases = ['x^3', '3*x^2 + 2*x - 5', 'sin(x)*x', 'x/(x^2+1)', 'exp(2*x)', 'ln(x^2+1)', 'sqrt(x)', 'x^x', 'cos(3*x)^2', '2^x', 'tan(x)', 'x^-1', '-x^2']
  for (const s of cases) it(`d/dx ${s}`, () => {
    const f = p(s), df = C.deriv(f)
    for (const x of [0.7, 1.3, 2.1]) { const exact = C.evalNode(df, x), approx = C.numDeriv(f, x); expect(Math.abs(exact - approx) < 1e-5 * (1 + Math.abs(exact))).toBe(true) }
  })
  it('formas simples: x^3 → 3 * x^2; constante → 0; sin(x) → cos(x)', () => { expect(C.str(C.deriv(p('x^3')))).toBe('3 * x^2'); expect(C.str(C.deriv(p('7')))).toBe('0'); expect(C.str(C.deriv(p('sin(x)')))).toBe('cos(x)') })
  it('segunda derivada de x^4 em x=2 = 48', () => expect(C.evalNode(C.derivN(p('x^4'), 2), 2)).toBe(48))
  it('regras detectadas', () => { const r = C.rulesOf(p('sin(x^2)*x')); expect(r.includes('regra do produto')).toBe(true); expect(r.includes('regra da cadeia')).toBe(true) })
  it('rejeita entradas perigosas ou mal formadas', () => {
    for (const s of ['', 'alert(1)', '2x', 'x+', '(x', 'constructor', 'y^2', '1;2']) { let e = false; try { p(s) } catch { e = true } expect(e).toBe(true) }
  })
})
describe('integral', () => {
  it('antiderivada derivada devolve o integrando', () => {
    for (const s of ['3*x^2+2*x-5', 'sin(x)+cos(x)', 'exp(x)/2', '1/x', 'x^-2', '4']) {
      const f = p(s), F = C.antiderivative(f)
      for (const x of [0.8, 1.9]) expect(Math.abs(C.numDeriv(F, x) - C.evalNode(f, x)) < 1e-5).toBe(true)
    }
  })
  it('fora do subconjunto é erro claro (x*x, sin(x^2))', () => { for (const s of ['x*x', 'sin(x^2)']) { let e = ''; try { C.integ(p(s)) } catch (x) { e = (x as Error).message } expect(e.includes('subconjunto')).toBe(true) } })
  it('Simpson: ∫0^π sin = 2; ∫0^1 x² = 1/3', () => { expect(C.integrate(p('sin(x)'), 0, Math.PI, 'simpson')).toBeCloseTo(2, 9); expect(C.integrate(p('x^2'), 0, 1, 'simpson')).toBeCloseTo(1 / 3, 12) })
  it('trapézio é menos preciso mas converge: ∫0^1 x² ≈ 1/3 (6 casas)', () => expect(C.integrate(p('x^2'), 0, 1, 'trapezoid', 1000)).toBeCloseTo(1 / 3, 5))
  it('integrando singular: erro em ∫-1^1 1/x', () => { let e = false; try { C.integrate(p('1/x'), -1, 1, 'simpson', 1000) } catch { e = true } expect(e).toBe(true) })
})
describe('limites e Newton', () => {
  it('sen(x)/x → 1 em 0', () => { const l = C.limitNumeric(p('sin(x)/x'), 0); expect(l.agree).toBe(true); expect(l.value!).toBeCloseTo(1, 5) })
  it('(x^2-1)/(x-1) → 2 em 1', () => expect(C.limitNumeric(p('(x^2-1)/(x-1)'), 1).value!).toBeCloseTo(2, 3))
  it('1/x em 0: laterais divergem e não há limite', () => { const l = C.limitNumeric(p('1/x'), 0); expect(l.agree).toBe(false); expect(l.right.note).toBe('tende a +∞'); expect(l.left.note).toBe('tende a −∞') })
  it('Newton: x²−2 com x0=1 → √2; f′=0 → erro', () => { const r = C.newton(p('x^2-2'), 1); expect(r.ok && r.root).toBeCloseTo(Math.SQRT2, 10); expect(C.newton(p('x^2+1'), 0).ok).toBe(false) })
})
describe('lógica', () => {
  const kind = (s: string) => D.truthTable(s).kind
  it('p | !p tautologia; p & !p contradição; p -> q contingência', () => { expect(kind('p | !p')).toBe('Tautologia'); expect(kind('p & !p')).toBe('Contradição'); expect(kind('p -> q')).toBe('Contingência') })
  it('tabela de p -> q: V,V,F,V na ordem VV,VF,FV,FF', () => expect(D.truthTable('p->q').rows.map(r => r.out)).toEqual([true, false, true, true]))
  it('De Morgan: !(p&q) ≡ !p | !q; p->q ≡ !p | q; p|q não ≡ p&q', () => {
    expect(D.equivalent('!(p&q)', '!p | !q').equivalent).toBe(true); expect(D.equivalent('p->q', '!p|q').equivalent).toBe(true); expect(D.equivalent('p|q', 'p&q').equivalent).toBe(false)
  })
  it('contrapositiva e bicondicional', () => { expect(D.equivalent('p->q', '!q->!p').equivalent).toBe(true); expect(kind('(p->q)&(q->p) <-> (p<->q)')).toBe('Tautologia') })
  it('expressões inválidas', () => { for (const s of ['', 'p &', '(p', 'p q', 'p % q', 'a&b&c&d&e&f&g']) { let e = false; try { D.truthTable(s) } catch { e = true } expect(e).toBe(true) } })
})
describe('conjuntos, bases, aritmética modular, sequências', () => {
  it('conjuntos sem duplicatas e ordenados', () => expect(D.parseSet('3, 1, 2, 3, ,1')).toEqual(['1', '2', '3']))
  it('operações', () => { const o = D.setOps(['1', '2', '3'], ['2', '3', '4']); expect(o.union).toEqual(['1', '2', '3', '4']); expect(o.inter).toEqual(['2', '3']); expect(o.sym).toEqual(['1', '4']); expect(o.powerSize).toBe(8); expect(o.cartesian).toBe(9); expect(o.aSubB).toBe(false) })
  it('bases: 255 = FF = 11111111 = 377', () => { const v = D.parseBase('255', 10); if (v.ok) { expect(D.toBase(v.value, 16)).toBe('FF'); expect(D.toBase(v.value, 2)).toBe('11111111'); expect(D.toBase(v.value, 8)).toBe('377') } })
  it('bases inválidas e negativos', () => { expect(D.parseBase('102', 2).ok).toBe(false); expect(D.parseBase('', 10).ok).toBe(false); expect(D.parseBase('GG', 16).ok).toBe(false); const n = D.parseBase('-ff', 16); expect(n.ok && n.value === -255n).toBe(true) })
  it('número enorme exato em hexa', () => { const v = D.parseBase('FFFFFFFFFFFFFFFFFFFF', 16); expect(v.ok && D.toBase(v.value, 10)).toBe('1208925819614629174706175') })
  it('modular: 3^200 mod 13 = 9; inverso de 3 mod 7 = 5; 2 mod 4 sem inverso; negativos', () => {
    expect(D.modPow(3n, 200n, 13n)).toBe(9n); expect(D.modInverse(3n, 7n)).toBe(5n); expect(D.modInverse(2n, 4n)).toBe(null); expect(D.modInverse(-3n, 7n)).toBe(2n)
  })
  it('PA e PG', () => { const a = D.progression('pa', 2, 3, 10); expect(a.an).toBe(29); expect(a.sn).toBe(155); const g = D.progression('pg', 2, 3, 5); expect(g.an).toBe(162); expect(g.sn).toBe(242); expect(D.progression('pg', 5, 1, 4).sn).toBe(20) })
  it('Fibonacci: F(0)=0, F(10)=55, F(100) exato', () => { expect(D.fibonacci(0)).toBe(0n); expect(D.fibonacci(10)).toBe(55n); expect(D.fibonacci(100).toString()).toBe('354224848179261915075') })
})
