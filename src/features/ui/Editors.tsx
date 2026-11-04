import { useRef, useState } from 'react'
import { polyStr } from '../../core/poly'

function useCaret(value: string, set: (v: string) => void) {
  const ref = useRef<HTMLInputElement>(null)
  return { ref, insert: (t: string) => { const el = ref.current, a = el?.selectionStart ?? value.length, b = el?.selectionEnd ?? value.length; set(value.slice(0, a) + t + value.slice(b)); requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(a + t.length, a + t.length) }) } }
}
const Keys = ({ keys, onKey, label }: { keys: string[]; onKey: (k: string) => void; label: string }) => (<div className="keyrow" role="group" aria-label={label}>{keys.map(k => <button type="button" key={k} onClick={() => onKey(k)}>{k}</button>)}</div>)

export function ExprEditor({ id, label, value, set }: { id: string; label: string; value: string; set: (v: string) => void }) {
  const { ref, insert } = useCaret(value, set)
  return (<div className="editor"><input id={id} ref={ref} className="mathfield big" aria-label={label} spellCheck={false} autoComplete="off" placeholder="ex.: x^2 * sin(x)" value={value} onChange={e => set(e.target.value)} />
    <Keys label="Teclado de funções" onKey={insert} keys={['x', '^', '*', '/', '(', ')', 'sin(', 'cos(', 'tan(', 'exp(', 'ln(', 'sqrt(', 'abs(', 'pi', 'e']} /></div>)
}
export function OpsEditor({ id, label, value, set }: { id: string; label: string; value: string; set: (v: string) => void }) {
  const { ref, insert } = useCaret(value, set)
  return (<div className="editor"><input id={id} ref={ref} className="mathfield big" aria-label={label} spellCheck={false} autoComplete="off" placeholder="ex.: (p → q) ∧ (q → r)" value={value} onChange={e => set(e.target.value)} />
    <Keys label="Conectivos" onKey={insert} keys={['¬', '∧', '∨', '→', '↔', '⊕', '(', ')']} /><Keys label="Variáveis" onKey={insert} keys={['p', 'q', 'r', 's']} /></div>)
}
export function ChipsEditor({ id, label, value, set, comma }: { id: string; label: string; value: string; set: (v: string) => void; comma?: boolean }) {
  const [draft, setDraft] = useState('')
  const sep = comma ? /[,;\n]+/ : /[;\n\s]+/, items = value.split(sep).map(x => x.trim()).filter(Boolean), join = (a: string[]) => a.join(comma ? ', ' : ' ')
  const add = (raw: string) => { const parts = raw.split(sep).map(x => x.replace(/^,+|,+$/g, '').trim()).filter(Boolean); if (parts.length) set(join([...items, ...parts])); setDraft('') }
  return (<div className="chips" role="group" aria-label={label}>
    {items.map((x, i) => <span className="chip" key={i}>{x}<button type="button" aria-label={`Remover ${x}`} onClick={() => set(join(items.filter((_, k) => k !== i)))}>×</button></span>)}
    <input id={id} aria-label={`${label}: adicionar valor`} className="chip-input" value={draft} placeholder={items.length ? '' : 'digite e pressione Enter'}
      onChange={e => { const v = e.target.value; if (!comma && /[\s;]$/.test(v) && v.trim()) add(v); else setDraft(v) }} onBlur={() => add(draft)}
      onKeyDown={e => { if (e.key === 'Enter' || (comma && e.key === ',')) { e.preventDefault(); add(draft) } else if (e.key === 'Backspace' && !draft && items.length) set(join(items.slice(0, -1))) }}
      onPaste={e => { e.preventDefault(); add(e.clipboardData.getData('text')) }} />
    {items.length > 0 && <button type="button" className="linkish" onClick={() => set('')}>limpar</button>}<small className="count">{items.length} {items.length === 1 ? 'valor' : 'valores'}</small></div>)
}
export function PairsEditor({ label, xs, ys, setX, setY, hx, hy }: { label: string; xs: string; ys: string; setX: (v: string) => void; setY: (v: string) => void; hx: string; hy: string }) {
  const sp = (s: string) => s.split(/[;\n\s]+/).filter(Boolean), X = sp(xs), Y = sp(ys), n = Math.max(X.length, Y.length, 1), rows = Array.from({ length: n }, (_, i) => [X[i] ?? '', Y[i] ?? ''])
  const commit = (r: string[][]) => { const k = r.filter(([a, b]) => a !== '' || b !== ''); setX(k.map(([a]) => a || '0').join(' ')); setY(k.map(([, b]) => b || '0').join(' ')) }
  const upd = (i: number, j: number, v: string) => commit(rows.map((r, k) => (k === i ? r.map((c, m) => (m === j ? v : c)) : r)))
  return (<div className="pairs" role="group" aria-label={label}><table><thead><tr><th>#</th><th>{hx}</th><th>{hy}</th><th /></tr></thead><tbody>
    {rows.map((r, i) => <tr key={i}><td>{i + 1}</td>{[0, 1].map(j => <td key={j}><input inputMode="decimal" aria-label={`${j ? hy : hx}, linha ${i + 1}`} value={r[j]} onChange={e => upd(i, j, e.target.value)} /></td>)}
      <td><button type="button" aria-label={`Remover linha ${i + 1}`} onClick={() => commit(rows.filter((_, k) => k !== i))}>×</button></td></tr>)}</tbody></table>
    <button type="button" onClick={() => commit([...rows.filter(r => r[0] !== '' || r[1] !== ''), ['0', '0']])}>+ linha</button></div>)
}
export function CoeffEditor({ label, value, set }: { label: string; value: string; set: (v: string) => void }) {
  const c = value.split(/[\s,;]+/).filter(Boolean), N = c.length ? c : ['1'], deg = N.length - 1
  const n = N.map(Number), preview = n.every(Number.isFinite) ? polyStr(n) : '…'
  const setDeg = (d: number) => { d = Math.min(10, Math.max(0, d)); const cur = [...N]; while (cur.length < d + 1) cur.unshift('0'); while (cur.length > d + 1) cur.shift(); set(cur.join(' ')) }
  const sup = (e: number) => (e === 0 ? '1' : e === 1 ? 'x' : `x${String(e).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])}`)
  return (<div className="coeffs" role="group" aria-label={label}><div className="coeff-row">{N.map((x, i) => <label key={i}><input inputMode="decimal" aria-label={`Coeficiente de grau ${deg - i}`} value={x} onChange={e => set(N.map((y, k) => (k === i ? e.target.value : y)).join(' '))} /><span>{sup(deg - i)}</span></label>)}</div>
    <div className="coeff-meta"><span className="stepper"><button type="button" aria-label="Diminuir grau" onClick={() => setDeg(deg - 1)}>−</button><output aria-label="Grau">grau {deg}</output><button type="button" aria-label="Aumentar grau" onClick={() => setDeg(deg + 1)}>+</button></span><code>{preview}</code></div></div>)
}
