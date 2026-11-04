export type Pyth = { ok: true; a: number; b: number; c: number; found: 'a' | 'b' | 'c' } | { ok: false; error: string }
/** Informe exatamente dois dos três valores. c = hipotenusa. */
export function pythagoras(a?: number, b?: number, c?: number): Pyth {
  const given = [a, b, c].filter(x => x !== undefined).length
  if (given !== 2) return { ok: false, error: 'Preencha exatamente dois valores e deixe o terceiro em branco.' }
  if ([a, b, c].some(x => x !== undefined && !(x > 0))) return { ok: false, error: 'Os lados devem ser números positivos.' }
  if (c === undefined) return { ok: true, a: a!, b: b!, c: Math.hypot(a!, b!), found: 'c' }
  const leg = c === undefined ? 0 : (a === undefined ? b! : a!)
  if (c <= leg) return { ok: false, error: 'A hipotenusa deve ser maior que o cateto informado.' }
  const other = Math.sqrt(c * c - leg * leg)
  return a === undefined ? { ok: true, a: other, b: b!, c, found: 'a' } : { ok: true, a: a, b: other, c, found: 'b' }
}
