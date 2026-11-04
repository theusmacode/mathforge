import { useMemo, useState, type ReactNode } from 'react'
import type { Field } from '../core/types'
import { parseMatrix, dims } from '../core/matrix'
import { modules } from './modules'
import { actions } from './store'
import { KINDS, kindOf, exampleFor, MATRIX_DEFAULTS } from './kinds'
import { SPECS } from './ui/specs'
import { runTool, defaultOf, altsOf, num } from './ui/run'
import { ExprEditor, OpsEditor, ChipsEditor, PairsEditor, CoeffEditor } from './ui/Editors'
import ChartView, { CompareBars } from '../components/ChartView'
import MatrixGrid from '../components/MatrixGrid'

const sub = (i: number) => String(i).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[+d])
/** Equações escritas a partir da matriz aumentada que o usuário está editando. */
function equations(text: string): string[] | null {
  try { const m = parseMatrix(text), k = m[0].length - 1; return m.map(r => { const terms = r.slice(0, k).map((c, j) => [c, j] as const).filter(([c]) => c !== 0)
    const lhs = terms.length ? terms.map(([c, j], i) => `${i ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : ''}${Math.abs(c) === 1 ? '' : +Math.abs(c).toPrecision(8)}x${sub(j + 1)}`).join('') : '0'; return `${lhs} = ${+r[k].toPrecision(8)}` }) } catch { return null }
}

export default function ToolShell({ tool, initial, openGraph }: { tool: { id: string; category: string }; initial: Record<string, string>; openGraph?: (expr: string) => void }) {
  const mod = modules[tool.id], spec = SPECS[tool.id], kind = kindOf(tool), info = KINDS[kind]
  const [raw, setRaw] = useState<Record<string, string>>(() => { const r = { ...initial }; for (const f of mod.fields) if (f.matrix && !r[f.id]) r[f.id] = MATRIX_DEFAULTS[f.matrix]; return r })
  const [units, setUnits] = useState<Record<string, number>>(() => Object.fromEntries(Object.entries(initial).filter(([k]) => k.startsWith('__u_')).map(([k, v]) => [k.slice(4), Number(v)])))
  const [touched, setTouched] = useState(false), [copied, setCopied] = useState(false), [tab, setTab] = useState(0)
  const out = useMemo(() => runTool(tool.id, raw, units), [tool.id, raw, units])
  const res = out.res && out.res.ok ? out.res : null
  const set = (id: string, v: string) => { setRaw(r => ({ ...r, [id]: v })); setCopied(false) }
  const val = (f: Field) => raw[f.id] ?? defaultOf(f)
  const examples = mod.fields.filter(f => f.text && !f.matrix && exampleFor(tool.id, f.id))
  const calc = () => { setTouched(true); if (res) actions.record({ toolId: tool.id, inputs: { ...Object.fromEntries(mod.fields.map(f => [f.id, val(f)])), ...Object.fromEntries(Object.entries(units).filter(([, u]) => u).map(([k, u]) => [`__u_${k}`, String(u)])) }, summary: res.outputs.map(o => `${o.label}: ${o.value}`).join(' · ') }) }
  const clear = () => { setRaw(Object.fromEntries(mod.fields.filter(f => f.matrix).map(f => [f.id, MATRIX_DEFAULTS[f.matrix!]]))); setUnits({}); setTouched(false) }
  const useExample = () => setRaw(r => ({ ...r, ...Object.fromEntries(examples.map(f => [f.id, exampleFor(tool.id, f.id)!])) }))
  const copy = () => res && navigator.clipboard?.writeText(res.outputs.map(o => `${o.label}: ${o.value}`).join('\n')).then(() => setCopied(true), () => setCopied(false))
  const partner = (id: string) => Object.entries(spec.editors ?? {}).find(([, e]) => e === `pairs:${id}`)?.[0]

  /** Controle (sem rótulo) do campo, escolhido pelo plano de interface da ferramenta. */
  const control = (f: Field): ReactNode => {
    const v = val(f), ed = spec.editors?.[f.id], id = `f-${f.id}`
    if (f.matrix) return <MatrixGrid key={f.id} label={f.label} aug={f.matrix === 'aug'} value={v} onChange={x => set(f.id, x)} />
    if (ed === 'expr') return <ExprEditor id={id} label={f.label} value={v} set={x => set(f.id, x)} />
    if (ed === 'ops') return <OpsEditor id={id} label={f.label} value={v} set={x => set(f.id, x)} />
    if (ed === 'chips' || ed === 'chips,') return <ChipsEditor id={id} label={f.label} value={v} comma={ed === 'chips,'} set={x => set(f.id, x)} />
    if (ed === 'coeffs') return <CoeffEditor label={f.label} value={v} set={x => set(f.id, x)} />
    if (ed?.startsWith('pairs:')) { const o = mod.fields.find(g => g.id === ed.slice(6))!; return <PairsEditor label={f.label} xs={v} ys={val(o)} setX={x => set(f.id, x)} setY={x => set(o.id, x)} hx={f.label.split(' ')[0] || 'X'} hy={o.label.split(' ')[0] || 'Y'} /> }
    if (f.options) return <select id={id} aria-label={f.label} value={v} onChange={e => set(f.id, e.target.value)}>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
    if (f.multiline) return <textarea id={id} className="mathfield" rows={3} spellCheck={false} aria-label={f.label} value={v} onChange={e => set(f.id, e.target.value)} />
    if (f.text) return <input id={id} className="mathfield" aria-label={f.label} spellCheck={false} autoComplete="off" placeholder={exampleFor(tool.id, f.id) ? `ex.: ${exampleFor(tool.id, f.id)}` : undefined} value={v} onChange={e => set(f.id, e.target.value)} onKeyDown={e => e.key === 'Enter' && calc()} />
    const alts = altsOf(tool.id, f)
    return (<span className="ig"><input id={id} inputMode="decimal" autoComplete="off" aria-label={f.label} value={v} onChange={e => set(f.id, e.target.value)} onKeyDown={e => e.key === 'Enter' && calc()} />
      {alts ? <select className="unit-sel" aria-label={`Unidade de ${f.label}`} value={units[f.id] ?? 0} onChange={e => setUnits(u => ({ ...u, [f.id]: Number(e.target.value) }))}>{alts.map(([n], i) => <option key={n} value={i}>{n}</option>)}</select>
        : f.unit ? <span className="unit" aria-hidden>{f.unit}</span> : null}</span>)
  }
  const labeled = (f: Field) => <div className="field" key={f.id}><label htmlFor={`f-${f.id}`}>{f.label}{f.optional && <em className="opt"> opcional</em>}</label>{control(f)}</div>
  const hidden = new Set(mod.fields.filter(f => partner(f.id)).map(f => f.id))
  const inSentence = new Set([...(spec.sentence ?? '').matchAll(/\{(\w+)\}/g)].map(m => m[1]))
  const sentence = () => spec.sentence ? (
    <div className="sentence">{spec.sentence.split(/\{(\w+)\}/).map((tok, i) => { if (i % 2 === 0) return tok ? <span key={i} className="stext">{tok}</span> : null; const f = mod.fields.find(g => g.id === tok)!; return <span key={i} className={`slot ${f.matrix || spec.editors?.[f.id] ? 'block' : ''}`}>{control(f)}</span> })}</div>) : null
  const leftovers = mod.fields.filter(f => !inSentence.has(f.id) && !hidden.has(f.id) && !f.matrix && !(spec.layout === 'matrixop' && f.options))
  const sliders = Object.entries(spec.sliders ?? {}).map(([id, [min, max, step]]) => { const f = mod.fields.find(g => g.id === id)!, n = num(val(f)) ?? min
    return <label key={id} className="slider"><span>{f.label}</span><input type="range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, n))} aria-label={`Ajustar ${f.label}`} onChange={e => set(id, e.target.value)} /><output>{n}{f.unit === '%' ? '%' : ''}</output></label> })
  const actionsRow = <div className="actions"><button className="primary" onClick={calc}>Calcular</button><button onClick={clear}>Limpar</button>{examples.length > 0 && <button onClick={useExample}>Usar exemplo</button>}
    {openGraph && spec.layout === 'analysis' && <button onClick={() => openGraph(val(mod.fields.find(f => f.id === 'f')!))}>Abrir no módulo de gráficos</button>}</div>

  const matrixOp = () => {
    const ms = mod.fields.filter(f => f.matrix), opSel = mod.fields.find(f => f.options), others = mod.fields.filter(f => !f.matrix && !f.options)
    let hint: string | null = null
    try { const a = parseMatrix(val(ms[0])); if (ms[1]) { const b = parseMatrix(val(ms[1])); hint = spec.op === '×' ? (a[0].length === b.length ? `A (${dims(a)}) · B (${dims(b)}) → ${a.length}×${b[0].length}` : `Incompatível: A tem ${a[0].length} colunas e B tem ${b.length} linhas.`) : (a.length === b.length && a[0].length === b[0].length ? `Dimensões compatíveis (${dims(a)})` : `Incompatível: A é ${dims(a)} e B é ${dims(b)}.`) } else if (['det', '⁻¹', 'sist', 'cramer'].includes(spec.op!) && spec.op !== 'sist') hint = a.length === a[0].length ? `Matriz quadrada ${dims(a)}` : `Atenção: ${dims(a)} não é quadrada.` } catch { hint = null }
    const eq = spec.op === 'sist' || spec.op === 'cramer' ? equations(val(ms[0])) : null
    return (<section className="panel equation" aria-label="Operação">
      <div className="mop">{ms.map((m, i) => <div className="mop-cell" key={m.id}>{i > 0 && <span className="opglyph">{opSel ? control(opSel) : spec.op}</span>}{control(m)}</div>)}
        {ms.length === 1 && <span className="opglyph">{opSel ? control(opSel) : spec.op}</span>}{others.map(f => <div className="field" key={f.id}><label htmlFor={`f-${f.id}`}>{f.label}</label>{control(f)}</div>)}
        <span className="opglyph">=</span>
        <div className="mop-res" aria-label="Resultado">{res?.table ? <table className="matrix-view"><tbody>{res.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table> : <span className="muted">{out.error && touched ? out.error : res ? '—' : 'resultado'}</span>}</div></div>
      {hint && <p className={`mop-hint ${hint.startsWith('Incompat') || hint.startsWith('Atenção') ? 'warn' : ''}`}>{hint}</p>}
      {eq && <div className="equations" aria-label="Sistema de equações">{eq.map((l, i) => <code key={i}>{l}</code>)}</div>}{actionsRow}</section>)
  }
  const equationBar = () => (<section className={`panel equation ${spec.layout}`} aria-label={info.inputs}>{sentence()}
    {sliders.length > 0 && <div className="sliders" aria-label="Ajustes rápidos">{sliders}</div>}
    {leftovers.length > 0 && <div className="fields cols">{leftovers.map(labeled)}</div>}{actionsRow}</section>)

  const vis = res?.charts && res.charts.length > 1
    ? <section className="vis"><div className="tabs" role="tablist">{res.charts.map((c, i) => <button key={i} role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>Solução {i + 1}</button>)}</div><ChartView chart={res.charts[Math.min(tab, res.charts.length - 1)]} /></section>
    : res?.chart ? <section className="vis"><ChartView chart={res.chart} /></section> : null
  const results = () => {
    if (!res) return out.error && touched ? <div className="error" role="alert">{out.error}</div>
      : <div className="empty-state"><strong>Os resultados aparecem aqui.</strong><p>{out.error ?? 'Preencha os campos.'} O cálculo é atualizado enquanto você digita; “Calcular” salva no histórico.</p>{examples.length > 0 && <button onClick={useExample}>Usar exemplo</button>}</div>
    const kp = <section aria-label="Resultados"><div className="kpis">{res.outputs.map((o, i) => <div key={o.label} className={`kpi ${i === 0 ? 'main' : ''} ${o.value.length > 26 ? 'wide' : ''}`}><span>{o.label}</span><strong>{o.value}</strong></div>)}</div>
      {res.compare && <><h3>Comparação</h3><CompareBars c={res.compare} /></>}</section>
    return (<>
      {spec.layout !== 'matrixop' && res.steps[0] && res.steps[0].length < 140 && <p className="subst"><span>Substituição</span><code>{res.steps[0]}</code></p>}
      <div className={`res-grid ${vis ? 'with-vis' : ''} ${spec.layout}`}>{spec.layout === 'figure' || spec.layout === 'analysis' ? <>{vis}{kp}</> : <>{kp}{vis}</>}</div>
      {res.table && spec.layout !== 'matrixop' && <section><h3>{kind === 'finance' ? 'Tabela de evolução' : 'Tabela'}</h3><div className="table-wrap"><table><thead><tr>{res.table.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{res.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={c === 'V' ? 'tv' : c === 'F' ? 'tf' : ''}>{c}</td>)}</tr>)}</tbody></table></div></section>}
      <section className="explain"><div><h3>Fórmulas</h3>{res.formulas.length ? res.formulas.map(f => <p key={f} className="mono">{f}</p>) : <p className="muted">—</p>}</div>
        <div><h3>Passo a passo</h3>{res.steps.length ? <ol>{res.steps.map((s, i) => <li key={i}>{s}</li>)}</ol> : <p className="muted">Sem etapas intermediárias para esta ferramenta.</p>}</div></section>
      {res.notes && <section className="notes"><h3>{kind === 'finance' ? 'Premissas e limites' : 'Observações'}</h3>{res.notes.map((n, i) => <p key={i} className="muted">{n}</p>)}</section>}
      <div className="actions"><button onClick={copy}>{copied ? 'Copiado ✓' : 'Copiar resultado'}</button></div></>)
  }
  return (<div className={`workspace sw layout-${spec.layout} kind-${kind}`}>{spec.layout === 'matrixop' ? matrixOp() : equationBar()}<section className="panel results" aria-live="polite" aria-label="Resultados e explicação">{results()}</section></div>)
}
