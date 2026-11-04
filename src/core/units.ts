/** Conversões por fator até uma unidade-base por dimensão. Temperatura é tratada à parte (afim). */
export interface Unit { id: string; label: string; dim: string; f: number }
const u = (dim: string, id: string, label: string, f: number): Unit => ({ dim, id, label, f })
export const UNITS: Unit[] = [
  u('Comprimento', 'mm', 'milímetro (mm)', 1e-3), u('Comprimento', 'cm', 'centímetro (cm)', 1e-2), u('Comprimento', 'm', 'metro (m)', 1), u('Comprimento', 'km', 'quilômetro (km)', 1e3),
  u('Comprimento', 'in', 'polegada (in)', 0.0254), u('Comprimento', 'ft', 'pé (ft)', 0.3048), u('Comprimento', 'yd', 'jarda (yd)', 0.9144), u('Comprimento', 'mi', 'milha (mi)', 1609.344),
  u('Massa', 'mg', 'miligrama (mg)', 1e-6), u('Massa', 'g', 'grama (g)', 1e-3), u('Massa', 'kg', 'quilograma (kg)', 1), u('Massa', 't', 'tonelada (t)', 1e3), u('Massa', 'oz', 'onça (oz)', 0.028349523125), u('Massa', 'lb', 'libra (lb)', 0.45359237),
  u('Tempo', 'ms', 'milissegundo (ms)', 1e-3), u('Tempo', 's', 'segundo (s)', 1), u('Tempo', 'min', 'minuto (min)', 60), u('Tempo', 'h', 'hora (h)', 3600), u('Tempo', 'd', 'dia (d)', 86400),
  u('Área', 'cm2', 'cm²', 1e-4), u('Área', 'm2', 'm²', 1), u('Área', 'ha', 'hectare (ha)', 1e4), u('Área', 'km2', 'km²', 1e6), u('Área', 'ft2', 'pé quadrado (ft²)', 0.09290304),
  u('Volume', 'ml', 'mililitro (mL)', 1e-6), u('Volume', 'l', 'litro (L)', 1e-3), u('Volume', 'm3', 'm³', 1), u('Volume', 'galus', 'galão americano (gal)', 0.003785411784),
  u('Velocidade', 'ms-1', 'm/s', 1), u('Velocidade', 'kmh', 'km/h', 1 / 3.6), u('Velocidade', 'mph', 'milhas/h (mph)', 0.44704), u('Velocidade', 'kn', 'nó (kn)', 1852 / 3600),
  u('Ângulo', 'deg', 'grau (°)', Math.PI / 180), u('Ângulo', 'rad', 'radiano (rad)', 1), u('Ângulo', 'grad', 'grado (gon)', Math.PI / 200),
  u('Temperatura', 'c', 'Celsius (°C)', 1), u('Temperatura', 'k', 'Kelvin (K)', 1), u('Temperatura', 'f', 'Fahrenheit (°F)', 1),
]
const toK = (v: number, id: string) => (id === 'c' ? v + 273.15 : id === 'f' ? ((v - 32) * 5) / 9 + 273.15 : v)
const fromK = (k: number, id: string) => (id === 'c' ? k - 273.15 : id === 'f' ? ((k - 273.15) * 9) / 5 + 32 : k)
export type Conv = { ok: true; value: number } | { ok: false; error: string }
export function convert(value: number, from: Unit | undefined, to: Unit | undefined): Conv {
  if (!from || !to) return { ok: false, error: 'Unidade desconhecida.' }
  if (!Number.isFinite(value)) return { ok: false, error: 'Valor inválido.' }
  if (from.dim !== to.dim) return { ok: false, error: `Unidades incompatíveis: ${from.dim} e ${to.dim}.` }
  if (from.dim === 'Temperatura') {
    const k = toK(value, from.id)
    return k < -1e-9 ? { ok: false, error: 'Temperatura abaixo do zero absoluto.' } : { ok: true, value: fromK(k, to.id) }
  }
  return { ok: true, value: (value * from.f) / to.f }
}
