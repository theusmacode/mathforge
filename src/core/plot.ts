import { evaluate, type AngleMode } from './expression.ts'
export interface Pt { x: number; y: number | null }
export type Sampled = { ok: true; pts: Pt[] } | { ok: false; error: string }

/** Avalia expr(x) em n+1 pontos. Pontos fora do domínio viram y=null (lacuna). Erro só se TODOS falharem. */
export function sample(expr: string, xmin: number, xmax: number, n: number, mode: AngleMode): Sampled {
  if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || !(xmax > xmin)) return { ok: false, error: 'O intervalo deve ter xmin < xmax.' }
  const pts: Pt[] = []; let first = '', good = 0
  for (let i = 0; i <= n; i++) {
    const x = xmin + ((xmax - xmin) * i) / n, r = evaluate(expr, mode, { x })
    if (r.ok) { pts.push({ x, y: r.value }); good++ } else { if (!first) first = r.error; pts.push({ x, y: null }) }
  }
  return good ? { ok: true, pts } : { ok: false, error: first }
}
/** Faixa vertical robusta (percentis 1–99) com margem; evita que polos distorçam a escala. */
export function yRange(sets: Pt[][]): [number, number] {
  const ys = sets.flat().map(p => p.y).filter((y): y is number => y !== null).sort((a, b) => a - b)
  if (!ys.length) return [-1, 1]
  let lo = ys[Math.floor(0.01 * (ys.length - 1))], hi = ys[Math.ceil(0.99 * (ys.length - 1))]
  if (lo === hi) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.08; return [lo - pad, hi + pad]
}
/** Divide em trechos contínuos: quebra em lacunas e em saltos maiores que 1,5× a faixa visível (assíntotas). */
export function runs(pts: Pt[], lo: number, hi: number): Pt[][] {
  const out: Pt[][] = []; let cur: Pt[] = []; let prev: Pt | null = null
  const flush = () => { if (cur.length) out.push(cur); cur = [] }
  for (const p of pts) {
    if (p.y === null) { flush(); prev = null; continue }
    if (prev && Math.abs(p.y - (prev.y as number)) > (hi - lo) * 1.5) flush()
    cur.push(p); prev = p
  }
  flush(); return out
}
/** Zeros por mudança de sinal + bisecção. Descarta polos (|f| grande no ponto encontrado). Precisão ≈ 1e-9. */
export function findRoots(expr: string, xmin: number, xmax: number, n: number, mode: AngleMode): number[] {
  const s = sample(expr, xmin, xmax, n, mode); if (!s.ok) return []
  const f = (x: number) => { const r = evaluate(expr, mode, { x }); return r.ok ? r.value : NaN }
  const roots: number[] = []
  const add = (x: number) => { if (!roots.some(r => Math.abs(r - x) < 1e-6)) roots.push(x) }
  for (let i = 0; i < s.pts.length; i++) {
    const a = s.pts[i], b = s.pts[i + 1]
    if (a.y !== null && Math.abs(a.y) < 1e-12) { add(a.x); continue }
    if (!b || a.y === null || b.y === null || a.y * b.y >= 0) continue
    let lo = a.x, hi = b.x, flo = a.y
    for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2, fm = f(m); if (Number.isNaN(fm)) break; if (fm * flo <= 0) hi = m; else { lo = m; flo = fm } }
    const x = (lo + hi) / 2, fx = f(x)
    if (Math.abs(fx) < 1e-6 * (1 + Math.max(Math.abs(a.y), Math.abs(b.y)))) add(x)
  }
  return roots.sort((p, q) => p - q)
}
