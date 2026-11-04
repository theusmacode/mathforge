/** Taxa i em % por período; t no MESMO período da taxa. */
export const simpleInterest = (c: number, i: number, t: number) => {
  const juros = c * (i / 100) * t
  return { juros, montante: c + juros }
}
export const compoundInterest = (c: number, i: number, t: number) => {
  const montante = c * Math.pow(1 + i / 100, t)
  return { montante, juros: montante - c }
}
