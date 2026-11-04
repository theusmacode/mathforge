import { describe, it, expect } from 'vitest'
import { UNITS, convert } from '../core/units.ts'
import { pctChange, applyPct, originalValue, marginMarkup } from '../core/commercial.ts'
const U = (id: string) => UNITS.find(x => x.id === id)
const c = (v: number, a: string, b: string) => { const r = convert(v, U(a), U(b)); return r.ok ? r.value : NaN }
describe('conversão de unidades', () => {
  it('1 km = 1000 m; 1 in = 2,54 cm; 1 mi = 1609,344 m', () => { expect(c(1, 'km', 'm')).toBeCloseTo(1000, 9); expect(c(1, 'in', 'cm')).toBeCloseTo(2.54, 9); expect(c(1, 'mi', 'm')).toBeCloseTo(1609.344, 9) })
  it('massa, tempo, área, volume', () => { expect(c(1, 'lb', 'g')).toBeCloseTo(453.59237, 8); expect(c(2, 'h', 'min')).toBeCloseTo(120, 9); expect(c(1, 'ha', 'm2')).toBeCloseTo(10000, 6); expect(c(1, 'l', 'ml')).toBeCloseTo(1000, 6) })
  it('velocidade: 36 km/h = 10 m/s', () => expect(c(36, 'kmh', 'ms-1')).toBeCloseTo(10, 10))
  it('ângulo: 180° = π rad', () => expect(c(180, 'deg', 'rad')).toBeCloseTo(Math.PI, 12))
  it('temperatura: 100°C = 212°F; 0 K = −273,15°C; −40°C = −40°F', () => { expect(c(100, 'c', 'f')).toBeCloseTo(212, 9); expect(c(0, 'k', 'c')).toBeCloseTo(-273.15, 9); expect(c(-40, 'c', 'f')).toBeCloseTo(-40, 9) })
  it('rejeita abaixo do zero absoluto, unidades incompatíveis e desconhecidas', () => {
    expect(convert(-300, U('c'), U('k')).ok).toBe(false); expect(convert(1, U('m'), U('kg')).ok).toBe(false); expect(convert(1, U('m'), undefined).ok).toBe(false)
  })
  it('mesma unidade é identidade; valor 0', () => { expect(c(7.25, 'm', 'm')).toBeCloseTo(7.25, 12); expect(c(0, 'km', 'mi')).toBe(0) })
})
describe('comercial', () => {
  const v = (r: { ok: boolean; value?: number }) => (r.ok ? r.value : NaN)
  it('variação: 50→75 = +50%; 80→60 = −25%; zero inicial é erro', () => { expect(v(pctChange(50, 75))).toBeCloseTo(50, 10); expect(v(pctChange(80, 60))).toBeCloseTo(-25, 10); expect(pctChange(0, 5).ok).toBe(false) })
  it('desconto e aumento', () => { expect(v(applyPct(200, 15, 'discount'))).toBeCloseTo(170, 10); expect(v(applyPct(200, 10, 'increase'))).toBeCloseTo(220, 10) })
  it('desconto > 100% ou negativo é erro', () => { expect(applyPct(10, 101, 'discount').ok).toBe(false); expect(applyPct(10, -5, 'increase').ok).toBe(false) })
  it('valor original: 170 com 15% de desconto → 200; 220 com 10% de aumento → 200', () => { expect(v(originalValue(170, 15, 'discount'))).toBeCloseTo(200, 10); expect(v(originalValue(220, 10, 'increase'))).toBeCloseTo(200, 10); expect(originalValue(1, 100, 'discount').ok).toBe(false) })
  it('margem e markup: custo 60, venda 100', () => {
    const r = marginMarkup(60, 100); expect(r.ok).toBe(true)
    if (r.ok) { expect(r.profit).toBe(40); expect(r.margin).toBeCloseTo(40, 10); expect(r.markup).toBeCloseTo(66.6666666667, 8) }
  })
  it('custo zero e preço zero são erros', () => { expect(marginMarkup(0, 10).ok).toBe(false); expect(marginMarkup(10, 0).ok).toBe(false) })
})
