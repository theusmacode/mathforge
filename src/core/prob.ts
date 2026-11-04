/** erf por série de Taylor (|x| ≤ 3, erro ≈ 1e-13) e assintótica acima disso. */
export function erf(x: number): number {
  const ax = Math.abs(x), sg = x < 0 ? -1 : 1
  if (ax > 3) { const t = 1 / (2 * ax * ax), erfc = (Math.exp(-ax * ax) / (ax * Math.sqrt(Math.PI))) * (1 - t + 3 * t * t - 15 * t ** 3); return sg * (1 - erfc) }
  let term = ax, sum = ax; for (let n = 1; n < 80; n++) { term *= (-ax * ax) / n; sum += term / (2 * n + 1) }
  return sg * (2 / Math.sqrt(Math.PI)) * sum
}
export const normalCdf = (x: number, mu: number, sd: number) => 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2)))
export const normalPdf = (x: number, mu: number, sd: number) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))
export function binomPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0
  if (p === 0) return k === 0 ? 1 : 0
  if (p === 1) return k === n ? 1 : 0
  let lc = 0; for (let i = 1; i <= k; i++) lc += Math.log((n - k + i) / i)
  return Math.exp(lc + k * Math.log(p) + (n - k) * Math.log(1 - p))
}
export function regression(x: number[], y: number[]) {
  const n = x.length; if (n !== y.length) throw new Error(`X tem ${n} valores e Y tem ${y.length}: as listas devem ter o mesmo tamanho.`)
  if (n < 2) throw new Error('São necessários ao menos 2 pares de dados.')
  const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n
  let sxx = 0, syy = 0, sxy = 0; for (let i = 0; i < n; i++) { sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; sxy += (x[i] - mx) * (y[i] - my) }
  if (sxx === 0) throw new Error('Todos os valores de X são iguais: a regressão de Y sobre X não existe.')
  const slope = sxy / sxx, r = syy === 0 ? null : sxy / Math.sqrt(sxx * syy)
  return { n, mx, my, slope, intercept: my - slope * mx, r, r2: r === null ? null : r * r, covPop: sxy / n, covSample: sxy / (n - 1) }
}
