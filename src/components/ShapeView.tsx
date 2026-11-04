import type { Chart } from '../core/types'
type S = Extract<Chart, { kind: 'shape' }>
const W = 360, H = 240, P = 34
/** Desenho proporcional às medidas informadas (escala uniforme). Cubos/cilindros/cones/esferas são projeções esquemáticas. */
export default function ShapeView({ chart }: { chart: S }) {
  const d = chart.dims, L = chart.labels, fill = 'rgba(0,185,129,.14)', st = { stroke: '#00B981', strokeWidth: 2, fill, strokeLinejoin: 'round' as const }
  const fit = (w: number, h: number) => Math.min((W - 2 * P) / w, (H - 2 * P) / h)
  const T = (x: number, y: number, s: number, w: number, h: number) => [(W - w * s) / 2 + x * s, (H - h * s) / 2 + y * s] as const
  const txt = (x: number, y: number, s: string, a: 'middle' | 'start' | 'end' = 'middle') => <text x={x} y={y} textAnchor={a} className="dim">{s}</text>
  let body: JSX.Element
  switch (chart.shape) {
    case 'unitcircle': { const R = 86, cx = W / 2, cy = H / 2 + 4, t = d.t, tn = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), px = cx + R * Math.cos(t), py = cy - R * Math.sin(t), ar = 26, ex = cx + ar * Math.cos(tn), ey = cy - ar * Math.sin(tn)
      body = <g><line x1={cx - R - 14} x2={cx + R + 14} y1={cy} y2={cy} stroke="#4a4f55" /><line x1={cx} x2={cx} y1={cy - R - 14} y2={cy + R + 14} stroke="#4a4f55" /><circle cx={cx} cy={cy} r={R} {...st} />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#F3F4F6" strokeWidth={2} /><line x1={px} y1={py} x2={px} y2={cy} stroke="#00B981" strokeWidth={2.5} strokeDasharray="4 3" /><line x1={px} y1={py} x2={cx} y2={py} stroke="#F2C94C" strokeWidth={2.5} strokeDasharray="4 3" />
        {tn > 1e-6 && <path d={`M${cx + ar},${cy} A${ar},${ar} 0 ${tn > Math.PI ? 1 : 0} 0 ${ex},${ey}`} fill="none" stroke="#F3F4F6" />}<circle cx={px} cy={py} r={4.5} fill="#F3F4F6" />
        <text x={px + (Math.cos(t) >= 0 ? 8 : -8)} y={(py + cy) / 2} textAnchor={Math.cos(t) >= 0 ? 'start' : 'end'} className="dim" fill="#00B981">{L.s}</text><text x={(px + cx) / 2} y={py + (Math.sin(t) >= 0 ? -8 : 16)} textAnchor="middle" className="dim" fill="#F2C94C">{L.c}</text><text x={cx - R - 10} y={26} className="dim">{L.t}</text></g>; break }
    case 'rect': { const s = fit(d.w, d.h), w = d.w * s, h = d.h * s, [x, y] = T(0, 0, s, d.w, d.h); body = <g><rect x={x} y={y} width={w} height={h} {...st} />{L.d && <line x1={x} y1={y + h} x2={x + w} y2={y} stroke="#F2C94C" strokeDasharray="5 4" />}{txt(x + w / 2, y + h + 18, L.w)}{txt(x - 8, y + h / 2, L.h, 'end')}{L.mid && txt(x + w / 2, y + h / 2 + 4, L.mid)}{L.d && txt(x + w * 0.62, y + h * 0.3, L.d, 'start')}</g>; break }
    case 'circle': { const s = fit(2 * d.r, 2 * d.r), r = d.r * s, cx = W / 2, cy = H / 2
      body = <g><circle cx={cx} cy={cy} r={r} {...st} />{L.d && <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#F2C94C" strokeDasharray="5 4" />}<line x1={cx} y1={cy} x2={cx + r * 0.7} y2={cy - r * 0.7} stroke="#F3F4F6" strokeWidth={2} />{txt(cx + r * 0.42, cy - r * 0.5 - 6, L.r, 'start')}{L.d && txt(cx - r / 2, cy + 16, L.d)}{L.mid && txt(cx, cy + r * 0.45, L.mid)}{L.c && txt(cx, cy - r - 8, L.c)}<circle cx={cx} cy={cy} r={3} fill="#F2C94C" /></g>; break }
    case 'sector': { const th = Math.min(d.t, 2 * Math.PI - 1e-6), s = fit(2 * d.r, 2 * d.r), r = d.r * s, cx = W / 2, cy = H / 2, ex = cx + r * Math.cos(-th), ey = cy + r * Math.sin(-th)
      body = <g><circle cx={cx} cy={cy} r={r} fill="none" stroke="#303337" strokeDasharray="4 4" /><path d={`M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 ${th > Math.PI ? 1 : 0} 0 ${ex},${ey} Z`} {...st} />{txt(cx + r / 2, cy + 16, L.r)}{txt(cx + r * 0.35, cy - 8 - r * 0.1, L.t, 'start')}</g>; break }
    case 'triangle': { const a = d.a, b = d.b, c = d.c, ax = (a * a + c * c - b * b) / (2 * a), ay = Math.sqrt(Math.max(0, c * c - ax * ax)), minX = Math.min(0, ax), maxX = Math.max(a, ax), w = maxX - minX, s = fit(w, ay)
      const [bx, by] = T(-minX, ay, s, w, ay), [cx, cy] = T(a - minX, ay, s, w, ay), [px, py] = T(ax - minX, 0, s, w, ay)
      body = <g><polygon points={`${bx},${by} ${cx},${cy} ${px},${py}`} {...st} />{txt((bx + cx) / 2, by + 18, L.a)}{txt((cx + px) / 2 + 14, (cy + py) / 2, L.b, 'start')}{txt((bx + px) / 2 - 14, (by + py) / 2, L.c, 'end')}
        {L.B && txt(bx - 4, by - 8, L.B, 'end')}{L.C && txt(cx + 4, cy - 8, L.C, 'start')}{L.A && txt(px, py - 10, L.A)}</g>; break }
    case 'trapezoid': { const w = Math.max(d.B, d.b), s = fit(w, d.h), [x, y] = T(0, 0, s, w, d.h), B = d.B * s, b = d.b * s, h = d.h * s, off = (B - b) / 2
      body = <g><polygon points={`${x + (w * s - B) / 2},${y + h} ${x + (w * s + B) / 2},${y + h} ${x + (w * s + b) / 2},${y} ${x + (w * s - b) / 2},${y}`} {...st} />{txt(x + (w * s) / 2, y + h + 18, L.B)}{txt(x + (w * s) / 2, y - 8, L.b)}{txt(x + (w * s - B) / 2 + off / 2 - 10, y + h / 2, L.h, 'end')}</g>; break }
    case 'rhombus': { const s = fit(d.D, d.d), D = d.D * s, dd = d.d * s, cx = W / 2, cy = H / 2
      body = <g><polygon points={`${cx - D / 2},${cy} ${cx},${cy - dd / 2} ${cx + D / 2},${cy} ${cx},${cy + dd / 2}`} {...st} /><line x1={cx - D / 2} x2={cx + D / 2} y1={cy} y2={cy} stroke="#F2C94C" strokeDasharray="4 3" /><line x1={cx} x2={cx} y1={cy - dd / 2} y2={cy + dd / 2} stroke="#F2C94C" strokeDasharray="4 3" />{txt(cx + D / 4, cy - 6, L.D)}{txt(cx + 6, cy - dd / 4, L.d, 'start')}</g>; break }
    case 'cuboid': { const k = 0.35, ox = d.b * k, oy = d.b * k, w = d.a + ox, h = d.c + oy, s = fit(w, h), a = d.a * s, c = d.c * s, dx = ox * s, dy = oy * s, [x, y0] = T(0, oy, s, w, h)
      body = <g><rect x={x} y={y0} width={a} height={c} {...st} /><polygon points={`${x},${y0} ${x + dx},${y0 - dy} ${x + a + dx},${y0 - dy} ${x + a},${y0}`} {...st} /><polygon points={`${x + a},${y0} ${x + a + dx},${y0 - dy} ${x + a + dx},${y0 + c - dy} ${x + a},${y0 + c}`} {...st} />{txt(x + a / 2, y0 + c + 18, L.a)}{txt(x - 8, y0 + c / 2, L.c, 'end')}{txt(x + a + dx / 2 + 14, y0 - dy / 2 - 4, L.b, 'start')}</g>; break }
    case 'cylinder': { const s = fit(2 * d.r, d.h + 0.6 * d.r), r = d.r * s, h = d.h * s, ry = r * 0.3, cx = W / 2, top = (H - h - 2 * ry) / 2 + ry
      body = <g><path d={`M${cx - r},${top} L${cx - r},${top + h} A${r},${ry} 0 0 0 ${cx + r},${top + h} L${cx + r},${top} Z`} {...st} /><ellipse cx={cx} cy={top} rx={r} ry={ry} {...st} />{txt(cx, top + h + ry + 16, L.r)}{txt(cx + r + 10, top + h / 2, L.h, 'start')}</g>; break }
    case 'cone': { const s = fit(2 * d.r, d.h + 0.6 * d.r), r = d.r * s, h = d.h * s, ry = r * 0.3, cx = W / 2, top = (H - h - ry) / 2
      body = <g><path d={`M${cx},${top} L${cx - r},${top + h} A${r},${ry} 0 0 0 ${cx + r},${top + h} Z`} {...st} /><line x1={cx} x2={cx} y1={top} y2={top + h} stroke="#F2C94C" strokeDasharray="4 3" />{txt(cx + 8, top + h / 2, L.h, 'start')}{txt(cx, top + h + ry + 16, L.r)}</g>; break }
    default: { const s = fit(2 * d.r, 2 * d.r), r = d.r * s, cx = W / 2, cy = H / 2
      body = <g><circle cx={cx} cy={cy} r={r} {...st} /><ellipse cx={cx} cy={cy} rx={r} ry={r * 0.3} fill="none" stroke="#303337" strokeDasharray="4 3" /><line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#F2C94C" strokeWidth={2} />{txt(cx + r / 2, cy - 8, L.r)}</g> }
  }
  return <figure className="chart shape"><figcaption>{chart.title}</figcaption><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${chart.title}: ${Object.values(L).join(', ')}`}>{body}</svg>{chart.note && <p className="muted small">{chart.note}</p>}</figure>
}
