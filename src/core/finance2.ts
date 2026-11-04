export interface Row { k: number; pmt: number; interest: number; amort: number; balance: number }
export function price(pv: number, i: number, n: number): Row[] {
  const pmt = i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n)); let bal = pv; const rows: Row[] = []
  for (let k = 1; k <= n; k++) { const interest = bal * i, amort = pmt - interest; bal = k === n ? 0 : bal - amort; rows.push({ k, pmt, interest, amort, balance: Math.abs(bal) < 1e-8 ? 0 : bal }) }
  return rows
}
export function sac(pv: number, i: number, n: number): Row[] {
  const am = pv / n; let bal = pv; const rows: Row[] = []
  for (let k = 1; k <= n; k++) { const interest = bal * i; bal = k === n ? 0 : bal - am; rows.push({ k, pmt: am + interest, interest, amort: am, balance: bal }) }
  return rows
}
export const totals = (r: Row[]) => ({ paid: r.reduce((s, x) => s + x.pmt, 0), interest: r.reduce((s, x) => s + x.interest, 0) })
/** Taxa por período i tal que pv = Σ pmt/(1+i)^k (bisecção em [0, 1000%]). */
export function impliedRate(pv: number, pmt: number, n: number): number | null {
  const f = (i: number) => (i === 0 ? pmt * n : (pmt * (1 - Math.pow(1 + i, -n))) / i) - pv
  if (f(0) < 0) return null
  let lo = 0, hi = 10; if (f(hi) > 0) return null
  for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m }
  return (lo + hi) / 2
}
export const fvAnnuity = (pmt: number, i: number, n: number, begin: boolean) => (i === 0 ? pmt * n : pmt * ((Math.pow(1 + i, n) - 1) / i) * (begin ? 1 + i : 1))
