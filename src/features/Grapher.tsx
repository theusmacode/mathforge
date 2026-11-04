import { useEffect, useMemo, useRef, useState } from 'react'
import { sample, yRange, runs, findRoots, type Pt } from '../core/plot'
import { evaluate, type AngleMode } from '../core/expression'
import { parse, deriv, str } from '../core/calculus'
import { fmt } from '../core/format'
import { actions } from './store'

const COLORS = ['#00B981', '#F2C94C', '#6EA8FE', '#F2994A', '#BB86FC', '#EB5757']
interface Fn { id: number; expr: string; visible: boolean; d: boolean }
interface View { x0: number; x1: number; y0: number; y1: number; auto: boolean }
interface Series { key: string; label: string; color: string; dashed: boolean; pts: Pt[]; error: string | null }
const W = 860, H = 520, PL = 54, PR = 14, PT = 14, PB = 34
const clean = (s: string) => s.replace(/^\s*[a-zA-Z]\s*\(\s*x\s*\)\s*=\s*/, '').trim()
const NAMES = ['f', 'g', 'h', 'p', 'q', 'r']
const r5 = (v: number) => +v.toPrecision(5)
const step = (span: number) => { const raw = span / 8, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p }
const ticks = (a: number, b: number) => { const s = step(b - a), out: number[] = []; for (let t = Math.ceil(a / s) * s; t <= b + 1e-9; t += s) out.push(Math.abs(t) < s * 1e-9 ? 0 : +t.toPrecision(12)); return out }

export default function Grapher({ initial }: { initial: Record<string, string> }) {
  const given = [1, 2, 3, 4, 5, 6].map(i => initial[`f${i}`]).filter(Boolean)
  const [fns, setFns] = useState<Fn[]>((given.length ? given : ['x^2', '2*x + 1', 'sin(x)']).map((expr, i) => ({ id: i, expr, visible: true, d: false })))
  const [view, setView] = useState<View>({ x0: Number(initial.xmin ?? -10) || -10, x1: Number(initial.xmax ?? 10) || 10, y0: -10, y1: 10, auto: true })
  const [mode, setMode] = useState<AngleMode>(initial.mode === 'deg' ? 'deg' : 'rad')
  const [cursor, setCursor] = useState<number | null>(null)
  const [xv, setXv] = useState('')
  const [table, setTable] = useState(false)
  const [analysis, setAnalysis] = useState<string[] | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ sx: number; sy: number; v: View; lo: number; hi: number } | null>(null)

  const series: Series[] = useMemo(() => {
    const out: Series[] = []
    fns.forEach((f, i) => {
      const e = clean(f.expr); if (!f.visible || !e) return
      const s = sample(e, view.x0, view.x1, 800, mode)
      out.push({ key: `f${f.id}`, label: `${NAMES[i]}(x) = ${e}`, color: COLORS[i % 6], dashed: false, pts: s.ok ? s.pts : [], error: s.ok ? null : s.error })
      if (f.d && s.ok) { try { const de = str(deriv(parse(e))), ds = sample(de, view.x0, view.x1, 800, mode)
        out.push({ key: `d${f.id}`, label: `${NAMES[i]}′(x) = ${de}`, color: COLORS[i % 6], dashed: true, pts: ds.ok ? ds.pts : [], error: ds.ok ? null : ds.error }) } catch (err) { out.push({ key: `d${f.id}`, label: `${NAMES[i]}′ indisponível`, color: COLORS[i % 6], dashed: true, pts: [], error: (err as Error).message }) } }
    })
    return out
  }, [fns, view.x0, view.x1, mode])
  const [lo, hi] = view.auto ? yRange(series.map(s => s.pts)) : [view.y0, view.y1]
  const X = (x: number) => PL + ((x - view.x0) / (view.x1 - view.x0)) * (W - PL - PR)
  const Y = (y: number) => H - PB - ((y - lo) / (hi - lo)) * (H - PB - PT)
  const st = useRef({ view, lo, hi }); st.current = { view, lo, hi }

  const toData = (e: { clientX: number; clientY: number }) => { const b = svg.current!.getBoundingClientRect(), { view: v, lo: l, hi: h } = st.current
    return { x: v.x0 + (((e.clientX - b.left) / b.width) * W - PL) / (W - PL - PR) * (v.x1 - v.x0), y: h - (((e.clientY - b.top) / b.height) * H - PT) / (H - PB - PT) * (h - l) } }
  const zoom = (f: number, ax?: number, ay?: number) => { const { view: v, lo: l, hi: h } = st.current, cx = ax ?? (v.x0 + v.x1) / 2, cy = ay ?? (l + h) / 2
    setView({ x0: cx - (cx - v.x0) * f, x1: cx + (v.x1 - cx) * f, y0: cy - (cy - l) * f, y1: cy + (h - cy) * f, auto: false }) }
  useEffect(() => { const el = svg.current; if (!el) return
    const w = (e: WheelEvent) => { e.preventDefault(); const p = toData(e); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, p.x, p.y) }
    el.addEventListener('wheel', w, { passive: false }); return () => el.removeEventListener('wheel', w) }, []) // eslint-disable-line

  const onDown = (e: React.PointerEvent) => { (e.target as Element).setPointerCapture?.(e.pointerId); drag.current = { sx: e.clientX, sy: e.clientY, v: { ...view }, lo, hi } }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return setCursor(toData(e).x)
    const b = svg.current!.getBoundingClientRect(), dx = ((e.clientX - d.sx) / b.width) * W / (W - PL - PR) * (d.v.x1 - d.v.x0), dy = ((e.clientY - d.sy) / b.height) * H / (H - PB - PT) * (d.hi - d.lo)
    setView({ x0: d.v.x0 - dx, x1: d.v.x1 - dx, y0: d.lo + dy, y1: d.hi + dy, auto: false })
  }
  const setRange = (k: 'x0' | 'x1' | 'y0' | 'y1', raw: string) => { const n = Number(raw.replace(',', '.')); if (!Number.isFinite(n)) return
    const nv = { ...view, y0: lo, y1: hi, [k]: n, auto: k.startsWith('x') ? view.auto : false }
    if (nv.x1 > nv.x0 && (view.auto && k.startsWith('x') ? true : nv.y1 > nv.y0)) setView(nv) }
  const upd = (id: number, p: Partial<Fn>) => setFns(fns.map(f => (f.id === id ? { ...f, ...p } : f)))

  const analyze = () => {
    const out: string[] = [], act = fns.map((f, i) => ({ e: clean(f.expr), n: NAMES[i] })).filter((f, i) => f.e && fns[i].visible)
    const pt = (e: string, x: number) => { const r = evaluate(e, mode, { x }); return r.ok ? `(${fmt(x, 6)}, ${fmt(r.value, 6)})` : `x = ${fmt(x, 6)}` }
    for (const f of act) {
      const z = findRoots(f.e, view.x0, view.x1, 1000, mode); out.push(`${f.n}: zeros na janela → ${z.length ? z.map(x => fmt(x, 6)).join(' ; ') : 'nenhum encontrado'}`)
      if (view.x0 <= 0 && view.x1 >= 0) { const r = evaluate(f.e, mode, { x: 0 }); out.push(`${f.n}: intercepto y → ${r.ok ? fmt(r.value, 6) : 'não definido'}`) }
      try { const de = str(deriv(parse(f.e))), c = findRoots(de, view.x0, view.x1, 1000, mode); out.push(`${f.n}: pontos críticos (f′ = 0; extremos/vértice) → ${c.length ? c.map(x => pt(f.e, x)).join(' ; ') : 'nenhum encontrado'}`) } catch { out.push(`${f.n}: pontos críticos → fora do subconjunto simbólico suportado`) }
    }
    for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) { const z = findRoots(`(${act[i].e})-(${act[j].e})`, view.x0, view.x1, 1000, mode)
      out.push(`${act[i].n} ∩ ${act[j].n} → ${z.length ? z.map(x => pt(act[i].e, x)).join(' ; ') : 'nenhuma na janela'}`) }
    out.push('Métodos numéricos na janela visível (mudança de sinal + bisecção). Raízes duplas e pontos fora da janela podem não aparecer.')
    setAnalysis(out)
  }
  const xs = Array.from({ length: 11 }, (_, i) => view.x0 + ((view.x1 - view.x0) * i) / 10)
  const val = (e: string, x: number) => { const r = evaluate(clean(e), mode, { x }); return r.ok ? fmt(r.value, 6) : '—' }
  const save = () => actions.record({ toolId: 'grafico-funcoes', inputs: { ...Object.fromEntries(fns.map((f, i) => [`f${i + 1}`, f.expr])), xmin: String(view.x0), xmax: String(view.x1), mode }, summary: fns.filter(f => f.expr.trim()).map((f, i) => `${NAMES[i]}(x) = ${clean(f.expr)}`).join(' · ') })
  const copyTable = () => navigator.clipboard?.writeText([['x', ...fns.map((f, i) => NAMES[i])].join('\t'), ...xs.map(x => [fmt(x, 8), ...fns.map(f => (f.expr.trim() ? val(f.expr, x) : ''))].join('\t'))].join('\n'))
  const px = cursor === null ? null : X(cursor)

  return (
    <div className="grapher">
      <div className="g-side">
        <h2>Funções</h2>
        {fns.map((f, i) => { const s = series.find(q => q.key === `f${f.id}`)
          return (<div key={f.id} className="fn-row">
            <span className="swatch" style={{ background: COLORS[i % 6] }} aria-hidden />
            <label className="sr-only" htmlFor={`fn${f.id}`}>Função {NAMES[i]}</label>
            <input id={`fn${f.id}`} value={f.expr} placeholder={`${NAMES[i]}(x) = …`} spellCheck={false} autoComplete="off" onChange={e => upd(f.id, { expr: e.target.value })} aria-invalid={!!s?.error} />
            <button className="icon-btn" aria-pressed={f.visible} aria-label={`${f.visible ? 'Ocultar' : 'Exibir'} ${NAMES[i]}`} title={f.visible ? 'Ocultar' : 'Exibir'} onClick={() => upd(f.id, { visible: !f.visible })}>{f.visible ? '◉' : '○'}</button>
            <button className="icon-btn" aria-pressed={f.d} aria-label={`Derivada de ${NAMES[i]}`} title="Mostrar derivada (tracejada)" onClick={() => upd(f.id, { d: !f.d })}>f′</button>
            <button className="icon-btn" aria-label={`Remover ${NAMES[i]}`} onClick={() => setFns(fns.filter(q => q.id !== f.id))}>×</button>
            {s?.error && <p className="error mini" role="alert">{s.error}</p>}
          </div>) })}
        <div className="actions"><button disabled={fns.length >= 6} onClick={() => setFns([...fns, { id: Math.max(-1, ...fns.map(f => f.id)) + 1, expr: '', visible: true, d: false }])}>+ Adicionar função</button></div>
        <h2>Janela</h2>
        <div className="range">{(['x0', 'x1'] as const).map(k => <label key={k}>{k === 'x0' ? 'x mín' : 'x máx'}<input key={`${k}${r5(view[k])}`} defaultValue={r5(view[k])} onBlur={e => setRange(k, e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} /></label>)}
          {(['y0', 'y1'] as const).map((k, j) => <label key={k}>{j ? 'y máx' : 'y mín'}<input key={`${k}${r5(j ? hi : lo)}`} defaultValue={r5(j ? hi : lo)} onBlur={e => setRange(k, e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} /></label>)}</div>
        <div className="actions"><button aria-label="Aproximar" onClick={() => zoom(1 / 1.3)}>＋</button><button aria-label="Afastar" onClick={() => zoom(1.3)}>－</button>
          <button onClick={() => setView(v => ({ ...v, auto: true }))} aria-pressed={view.auto}>Ajustar y</button><button onClick={() => setView({ x0: -10, x1: 10, y0: -10, y1: 10, auto: true })}>Redefinir</button></div>
        <div className="actions" role="group" aria-label="Unidade de ângulo"><button aria-pressed={mode === 'rad'} onClick={() => setMode('rad')}>Radianos</button><button aria-pressed={mode === 'deg'} onClick={() => setMode('deg')}>Graus</button></div>
        <h2>Avaliar f(x)</h2>
        <label className="inline">x = <input value={xv} onChange={e => setXv(e.target.value)} inputMode="decimal" placeholder="ex.: 2" /></label>
        {xv.trim() !== '' && Number.isFinite(Number(xv.replace(',', '.'))) && fns.filter(f => f.expr.trim()).map((f, i) => <p key={f.id} className="out"><span style={{ color: COLORS[i % 6] }}>{NAMES[i]}({xv})</span><strong>{val(f.expr, Number(xv.replace(',', '.')))}</strong></p>)}
        <div className="actions"><button onClick={analyze}>Analisar janela</button><button onClick={save}>Salvar no histórico</button></div>
      </div>

      <div className="g-main">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="plot interactive" role="img" aria-label={`Gráfico: ${series.map(s => s.label).join('; ')}. Arraste para mover, role para ampliar.`}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerLeave={() => { drag.current = null; setCursor(null) }}>
          <defs><clipPath id="gclip"><rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} /></clipPath></defs>
          <rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} className="plot-bg" />
          {ticks(view.x0, view.x1).map(t => <g key={`x${t}`} className="plot-grid"><line x1={X(t)} x2={X(t)} y1={PT} y2={H - PB} /><text x={X(t)} y={H - PB + 16} textAnchor="middle">{fmt(t, 4)}</text></g>)}
          {ticks(lo, hi).map(t => <g key={`y${t}`} className="plot-grid"><line y1={Y(t)} y2={Y(t)} x1={PL} x2={W - PR} /><text x={PL - 6} y={Y(t) + 4} textAnchor="end">{fmt(t, 4)}</text></g>)}
          {lo < 0 && hi > 0 && <line className="axis" x1={PL} x2={W - PR} y1={Y(0)} y2={Y(0)} />}
          {view.x0 < 0 && view.x1 > 0 && <line className="axis" y1={PT} y2={H - PB} x1={X(0)} x2={X(0)} />}
          <text x={W - PR - 4} y={H - PB - 6} textAnchor="end" className="axl">x</text><text x={PL + 8} y={PT + 14} className="axl">y</text>
          <g clipPath="url(#gclip)">
            {series.map(s => runs(s.pts, lo, hi).map((r, j) => <polyline key={`${s.key}${j}`} fill="none" stroke={s.color} strokeWidth={2.2} strokeDasharray={s.dashed ? '6 5' : undefined} strokeLinejoin="round" points={r.map(p => `${X(p.x).toFixed(1)},${Y(p.y as number).toFixed(1)}`).join(' ')} />))}
            {px !== null && <><line className="trace" x1={px} x2={px} y1={PT} y2={H - PB} />{series.filter(s => !s.dashed).map(s => { const r = evaluate(clean(fns.find(f => `f${f.id}` === s.key)!.expr), mode, { x: cursor! }); return r.ok ? <circle key={s.key} cx={px} cy={Y(r.value)} r={4.5} fill={s.color} stroke="#101113" strokeWidth={1.5} /> : null })}</>}
          </g>
        </svg>
        <div className="legend-row">{series.map(s => <span key={s.key} className="lg"><i style={{ background: s.color, opacity: s.dashed ? 0.6 : 1 }} />{s.label}</span>)}</div>
        <div className="readout" aria-live="polite">{cursor === null ? <span className="muted">Passe o cursor sobre o gráfico para rastrear as curvas. Arraste para mover; role para ampliar.</span>
          : <><strong>x = {fmt(cursor, 5)}</strong>{fns.filter(f => f.visible && f.expr.trim()).map((f, i) => <span key={f.id} style={{ color: COLORS[fns.indexOf(f) % 6] }}>{NAMES[fns.indexOf(f)]} = {val(f.expr, cursor)}</span>)}</>}</div>
        {analysis && <section className="result"><h2>Análise da janela</h2>{analysis.map((a, i) => <p key={i} className={i === analysis.length - 1 ? 'muted' : 'mono'}>{a}</p>)}</section>}
        <div className="actions"><button aria-expanded={table} onClick={() => setTable(t => !t)}>{table ? 'Ocultar tabela de valores' : 'Tabela de valores'}</button>{table && <button onClick={copyTable}>Copiar tabela</button>}</div>
        {table && <div className="table-wrap"><table><thead><tr><th>x</th>{fns.map((f, i) => f.expr.trim() && <th key={f.id}>{NAMES[i]}(x)</th>)}</tr></thead>
          <tbody>{xs.map((x, r) => <tr key={r}><td>{fmt(x, 6)}</td>{fns.map(f => f.expr.trim() && <td key={f.id}>{val(f.expr, x)}</td>)}</tr>)}</tbody></table></div>}
        <p className="muted">Digite <code>f(x) = x^2</code> ou só <code>x^2</code>. Use * para multiplicar. Pontos fora do domínio ficam sem traço e assíntotas não são ligadas. A derivada tracejada usa o motor simbólico (subconjunto declarado).</p>
      </div>
    </div>
  )
}
