export const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a } // gcd(0,0)=0
/** Convenção: mmc(a,0)=0 e o resultado é sempre não negativo. */
export const lcm = (a: number, b: number) => (a === 0 || b === 0 ? 0 : Math.abs(a / gcd(a, b)) * Math.abs(b))
export type Factorization = { ok: true; negative: boolean; factors: { p: number; exp: number }[] } | { ok: false; error: string }
export const MAX_FACTOR = 1e12 // divisão por tentativa até 1e6: rápido
export function factorize(n: number): Factorization {
  if (!Number.isInteger(n)) return { ok: false, error: 'Informe um número inteiro.' }
  if (n === 0) return { ok: false, error: '0 não possui fatoração em primos.' }
  if (Math.abs(n) > MAX_FACTOR) return { ok: false, error: 'Limite: |n| ≤ 1 000 000 000 000.' }
  let m = Math.abs(n); const factors: { p: number; exp: number }[] = []
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) { let e = 0; while (m % p === 0) { m /= p; e++ } if (e) factors.push({ p, exp: e }) }
  if (m > 1) factors.push({ p: m, exp: 1 })
  return { ok: true, negative: n < 0, factors }
}
