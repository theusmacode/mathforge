export type R3 = { ok: true; x: number } | { ok: false; error: string }
/** a está para b assim como c está para x. direta: x = b·c/a. inversa: x = a·b/c. */
export function ruleOfThree(a: number, b: number, c: number, inverse: boolean): R3 {
  const den = inverse ? c : a
  if (den === 0) return { ok: false, error: inverse ? 'Na regra inversa, c não pode ser zero.' : 'Na regra direta, a não pode ser zero.' }
  const x = inverse ? (a * b) / c : (b * c) / a
  return Number.isFinite(x) ? { ok: true, x } : { ok: false, error: 'Resultado fora do limite numérico.' }
}
