import type { Chart, Compare } from '../core/types'
import { niceTicks } from '../core/ticks'
import { fmt } from '../core/format'
import ShapeView from './ShapeView'

const COLORS = ['#00B981', '#F2C94C', '#6EA8FE']
const W = 640, H = 300, PL = 58, PR = 16, PT = 14, PB = 42

export function CompareBars({ c }: { c: Compare }) {
  const max = Math.max(Math.abs(c.a.value), Math.abs(c.b.value), 1e-12), diff = c.b.value - c.a.value
  const row = (x: { label: string; value: number }, cls: string) => (
    <div className="cmp-row"><span>{x.label}</span><div className="cmp-track"><div className={`cmp-bar ${cls}`} style={{ width: `${Math.max(2, (Math.abs(x.value) / max) * 100)}%` }} /></div><strong>{c.unit === 'R$' ? 'R$ ' : ''}{fmt(x.value, 4)}</strong></div>)
  return <div className="cmp" role="img" aria-label={`${c.a.label}: ${fmt(c.a.value, 4)}; ${c.b.label}: ${fmt(c.b.value, 4)}`}>{row(c.a, 'a')}{row(c.b, 'b')}
    <p className="muted">Diferença: <strong>{diff >= 0 ? '+' : '−'}{c.unit === 'R$' ? 'R$ ' : ''}{fmt(Math.abs(diff), 4)}</strong></p></div>
}

const pack = (a: string[], k = 5) => (a.length <= k ? a : [...a.slice(0, k), `+${a.length - k}`])
function Venn({ c }: { c: Extract<Chart, { kind: 'venn' }> }) {
  const lines = (xs: string[], x: number) => pack(xs).map((e, i) => <text key={i} x={x} y={92 + i * 15} textAnchor="middle" className="dim">{e}</text>)
  return (<figure className="chart"><figcaption>{c.title}</figcaption><svg viewBox="0 0 360 220" role="img" aria-label={`${c.title}: só A ${c.only.join(', ')}; ambos ${c.both.join(', ')}; só B ${c.onlyB.join(', ')}`}>
    <circle cx={140} cy={110} r={82} fill="rgba(0,185,129,.14)" stroke="#00B981" strokeWidth={2} /><circle cx={220} cy={110} r={82} fill="rgba(242,201,76,.12)" stroke="#F2C94C" strokeWidth={2} />
    <text x={86} y={26} className="dim">{c.nameA} ({c.a.length})</text><text x={274} y={26} textAnchor="end" className="dim">{c.nameB} ({c.b.length})</text>
    {lines(c.only, 98)}{lines(c.both, 180)}{lines(c.onlyB, 262)}<text x={98} y={206} textAnchor="middle" className="blab">só A: {c.only.length}</text><text x={180} y={206} textAnchor="middle" className="blab">A ∩ B: {c.both.length}</text><text x={262} y={206} textAnchor="middle" className="blab">só B: {c.onlyB.length}</text></svg></figure>)
}
function FractionBars({ c }: { c: Extract<Chart, { kind: 'fractions' }> }) {
  return (<figure className="chart"><figcaption>{c.title}</figcaption><div className="fbars" role="img" aria-label={c.rows.map(r => `${r.label}: ${r.n}/${r.d}`).join('; ')}>
    {c.rows.map(r => <div key={r.label} className="fbar-row"><span>{r.label}</span><div className="fbar" style={{ gridTemplateColumns: `repeat(${r.d}, 1fr)` }}>{Array.from({ length: r.d }, (_, i) => <i key={i} className={i < Math.min(Math.max(r.n, 0), r.d) ? 'on' : ''} />)}</div><strong>{r.n}/{r.d}{r.n > r.d ? ` (${+(r.n / r.d).toPrecision(5)})` : ''}</strong></div>)}</div></figure>)
}
export default function ChartView({ chart }: { chart: Chart }) {
  if (chart.kind === 'shape') return <ShapeView chart={chart} />
  if (chart.kind === 'venn') return <Venn c={chart} />
  if (chart.kind === 'fractions') return <FractionBars c={chart} />
  const xs: number[] = [], ys: number[] = []
  if (chart.kind === 'line') chart.series.forEach(s => s.segs.forEach(g => g.forEach(([x, y]) => { xs.push(x); ys.push(y) })))
  if (chart.kind === 'scatter') chart.pts.forEach(([x, y]) => { xs.push(x); ys.push(y) })
  if (chart.kind === 'bars') { ys.push(0, ...chart.values) }
  let x0 = xs.length ? Math.min(...xs) : 0, x1 = xs.length ? Math.max(...xs) : 1, y0 = ys.length ? Math.min(...ys) : 0, y1 = ys.length ? Math.max(...ys) : 1
  if (chart.kind === 'line' && chart.marks) chart.marks.forEach(([x, y]) => { y0 = Math.min(y0, y); y1 = Math.max(y1, y) })
  if (chart.kind === 'scatter' && chart.fit) { y0 = Math.min(y0, chart.fit[0] * x0 + chart.fit[1], chart.fit[0] * x1 + chart.fit[1]); y1 = Math.max(y1, chart.fit[0] * x0 + chart.fit[1], chart.fit[0] * x1 + chart.fit[1]) }
  if (chart.kind === 'line' && chart.area) { x0 = Math.min(x0, chart.area[0]); x1 = Math.max(x1, chart.area[1]); y0 = Math.min(y0, 0); y1 = Math.max(y1, 0) }
  if (x1 === x0) { x0 -= 1; x1 += 1 }
  if (y1 === y0) { y0 -= 1; y1 += 1 }
  const py = (y1 - y0) * 0.08; if (chart.kind !== 'bars') { y0 -= py; y1 += py } else y1 += py
  const X = (x: number) => (chart.kind === 'bars' ? 0 : PL + ((x - x0) / (x1 - x0)) * (W - PL - PR)), Y = (y: number) => H - PB - ((y - y0) / (y1 - y0)) * (H - PB - PT)
  const xt = chart.kind === 'bars' ? [] : niceTicks(x0, x1), yt = niceTicks(y0, y1), bw = chart.kind === 'bars' ? (W - PL - PR) / Math.max(1, chart.labels.length) : 0
  const title = chart.title, legend = chart.kind === 'line' ? chart.series.map((s, i) => ({ n: s.name, c: COLORS[i % 3], d: !!s.dashed })) : []
  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} className="plot-bg" />
        {yt.map(t => <g key={`y${t}`} className="plot-grid"><line x1={PL} x2={W - PR} y1={Y(t)} y2={Y(t)} /><text x={PL - 6} y={Y(t) + 4} textAnchor="end">{fmt(t, 4)}</text></g>)}
        {xt.map(t => <g key={`x${t}`} className="plot-grid"><line x1={X(t)} x2={X(t)} y1={PT} y2={H - PB} /><text x={X(t)} y={H - PB + 15} textAnchor="middle">{fmt(t, 4)}</text></g>)}
        {y0 < 0 && y1 > 0 && <line className="axis" x1={PL} x2={W - PR} y1={Y(0)} y2={Y(0)} />}
        {chart.kind !== 'bars' && x0 < 0 && x1 > 0 && <line className="axis" y1={PT} y2={H - PB} x1={X(0)} x2={X(0)} />}
        {chart.kind === 'line' && chart.area && chart.series[0] && chart.series[0].segs.map((g, k) => { const pts = g.filter(([x]) => x >= chart.area![0] && x <= chart.area![1]); return pts.length > 1 ? <polygon key={k} fill="rgba(0,185,129,.18)" points={`${X(pts[0][0])},${Y(0)} ${pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} ${X(pts[pts.length - 1][0])},${Y(0)}`} /> : null })}
        {chart.kind === 'line' && chart.series.map((s, i) => s.segs.map((g, k) => <polyline key={`${i}-${k}`} fill="none" stroke={COLORS[i % 3]} strokeWidth={2.2} strokeLinejoin="round" strokeDasharray={s.dashed ? '6 5' : undefined} points={g.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ')} />))}
        {chart.kind === 'line' && chart.marks?.map(([x, y], i) => <circle key={i} cx={X(x)} cy={Y(y)} r={5} fill="#00B981" stroke="#101113" strokeWidth={2} />)}
        {chart.kind === 'scatter' && chart.fit && <line stroke="#F2C94C" strokeWidth={2} x1={X(x0)} y1={Y(chart.fit[0] * x0 + chart.fit[1])} x2={X(x1)} y2={Y(chart.fit[0] * x1 + chart.fit[1])} />}
        {chart.kind === 'scatter' && chart.pts.map(([x, y], i) => <circle key={i} cx={X(x)} cy={Y(y)} r={4.5} fill="#00B981" stroke="#101113" strokeWidth={1.5} />)}
        {chart.kind === 'bars' && chart.values.map((v, i) => <g key={i}><rect x={PL + i * bw + bw * 0.12} width={bw * 0.76} y={Y(v)} height={Math.max(0, Y(0) - Y(v))} fill="#00B981" rx={3} /><text x={PL + i * bw + bw / 2} y={H - PB + 15} textAnchor="middle" className="blab">{chart.labels.length > 14 && i % 2 ? '' : chart.labels[i]}</text></g>)}
        <text x={(W + PL) / 2} y={H - 4} textAnchor="middle" className="axl">{chart.kind === 'bars' ? 'Valor / classe' : chart.x}</text>
        <text x={12} y={PT + 8} className="axl">{chart.y}</text>
      </svg>
      {legend.length > 0 && <div className="legend-row">{legend.map(l => <span key={l.n} className="lg"><i style={{ background: l.c, opacity: l.d ? 0.6 : 1 }} />{l.n}</span>)}</div>}
    </figure>
  )
}
