const D = 180 / Math.PI, R = Math.PI / 180
export interface Tri { a: number; b: number; c: number; A: number; B: number; C: number; area: number; perimeter: number }
const acos = (x: number) => Math.acos(Math.max(-1, Math.min(1, x)))
/** Lados a,b,c (A,B,C opostos, em graus). Lança erro se violar a desigualdade triangular. */
export function fromSides(a: number, b: number, c: number): Tri {
  if (![a, b, c].every(x => Number.isFinite(x) && x > 0)) throw new Error('Os lados devem ser positivos.')
  const [x, y, z] = [a, b, c].sort((p, q) => p - q)
  if (!(x + y > z)) throw new Error(`Não forma triângulo: ${+x.toPrecision(8)} + ${+y.toPrecision(8)} ≤ ${+z.toPrecision(8)} (desigualdade triangular).`)
  const s = (a + b + c) / 2, area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))
  return { a, b, c, A: acos((b * b + c * c - a * a) / (2 * b * c)) * D, B: acos((a * a + c * c - b * b) / (2 * a * c)) * D, C: acos((a * a + b * b - c * c) / (2 * a * b)) * D, area, perimeter: a + b + c }
}
export function sas(a: number, b: number, Cdeg: number): Tri {
  if (!(Cdeg > 0 && Cdeg < 180)) throw new Error('O ângulo deve estar entre 0° e 180° (exclusive).')
  return fromSides(a, b, Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(Cdeg * R)))
}
export function asa(Adeg: number, Bdeg: number, c: number): Tri {
  if (!(Adeg > 0 && Bdeg > 0 && Adeg + Bdeg < 180)) throw new Error('Os dois ângulos devem ser positivos com soma menor que 180°.')
  if (!(c > 0)) throw new Error('O lado deve ser positivo.')
  const C = 180 - Adeg - Bdeg, k = c / Math.sin(C * R), a = k * Math.sin(Adeg * R), b = k * Math.sin(Bdeg * R)
  return { a, b, c, A: Adeg, B: Bdeg, C, area: 0.5 * a * b * Math.sin(C * R), perimeter: a + b + c }
}
/** Lado a oposto ao ângulo A; lado b dado. Pode haver 0, 1 ou 2 triângulos. */
export function ssa(a: number, b: number, Adeg: number): Tri[] {
  if (!(a > 0 && b > 0)) throw new Error('Os lados devem ser positivos.')
  if (!(Adeg > 0 && Adeg < 180)) throw new Error('O ângulo deve estar entre 0° e 180° (exclusive).')
  const sB = (b * Math.sin(Adeg * R)) / a
  if (sB > 1 + 1e-12) return []
  const B1 = Math.asin(Math.min(1, sB)) * D, out: Tri[] = []
  for (const B of Math.abs(sB - 1) < 1e-12 ? [90] : [B1, 180 - B1]) {
    if (Adeg + B >= 180 - 1e-12) continue
    const C = 180 - Adeg - B, c = (a * Math.sin(C * R)) / Math.sin(Adeg * R)
    out.push({ a, b, c, A: Adeg, B, C, area: 0.5 * a * b * Math.sin(C * R), perimeter: a + b + c })
  }
  return out
}
export function classify(t: Tri) {
  const eq = (x: number, y: number) => Math.abs(x - y) < 1e-9 * Math.max(x, y), s = [t.a, t.b, t.c].sort((p, q) => p - q)
  const bySide = eq(s[0], s[2]) ? 'equilátero' : eq(s[0], s[1]) || eq(s[1], s[2]) ? 'isósceles' : 'escaleno'
  const d = s[2] * s[2] - (s[0] * s[0] + s[1] * s[1]), byAngle = Math.abs(d) < 1e-9 * s[2] * s[2] ? 'retângulo' : d > 0 ? 'obtusângulo' : 'acutângulo'
  return `${bySide} e ${byAngle}`
}
