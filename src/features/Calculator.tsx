import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluate, type AngleMode } from '../core/expression'
import { actions, useStore } from './store'

interface Key { l: string; ins?: string; act?: string; alt?: { l: string; ins: string }; cls?: string }
const K = (l: string, ins?: string, extra: Partial<Key> = {}): Key => ({ l, ins: ins ?? l, ...extra })
const FN: Key[][] = [
  [K('sin', 'sin(', { alt: { l: 'asin', ins: 'asin(' } }), K('cos', 'cos(', { alt: { l: 'acos', ins: 'acos(' } }), K('tan', 'tan(', { alt: { l: 'atan', ins: 'atan(' } }), K('ln', 'ln(', { alt: { l: 'eˣ', ins: 'exp(' } }), K('log', 'log(', { alt: { l: 'log₂', ins: 'log2(' } })],
  [K('sinh', 'sinh('), K('cosh', 'cosh('), K('tanh', 'tanh('), K('√', 'sqrt(', { alt: { l: '∛', ins: 'cbrt(' } }), K('x²', '^2', { alt: { l: 'xʸ', ins: '^' } })],
  [K('|x|', 'abs('), K('x!', '!'), K('1/x', '1/('), K('π', 'pi'), K('e', 'e')],
]
const PAD: Key[][] = [
  [K('(', '('), K(')', ')'), K('%', '%'), { l: '⌫', act: 'del', cls: 'op' }, { l: 'AC', act: 'ac', cls: 'op' }],
  [K('7'), K('8'), K('9'), K('÷', '/', { cls: 'op' }), K('^', '^', { cls: 'op' })],
  [K('4'), K('5'), K('6'), K('×', '*', { cls: 'op' }), K('EE', 'E', { cls: 'op' })],
  [K('1'), K('2'), K('3'), K('−', '-', { cls: 'op' }), { l: 'ANS', ins: 'ans', cls: 'op' }],
  [K('0'), K('.'), K('(−)', '-'), K('+', '+', { cls: 'op' }), { l: '=', act: 'eq', cls: 'eq' }],
]
const MEM = ['MC', 'MR', 'M+', 'M−', 'MS']
const MATH_ERR = /zero|logaritmo|raiz|fatorial|tangente|asin|acos|finito|limite/i
const show = (v: number) => String(+v.toPrecision(14))

export default function Calculator({ scientific, toolId, initial }: { scientific: boolean; toolId: string; initial: Record<string, string> }) {
  const nav = useNavigate()
  const ref = useRef<HTMLInputElement>(null)
  const [expr, setExpr] = useState(initial.expr ?? '')
  const [mode, setMode] = useState<AngleMode>(initial.mode === 'rad' ? 'rad' : 'deg')
  const [second, setSecond] = useState(false)
  const [ans, setAns] = useState<number | null>(null)
  const [mem, setMem] = useState<number | null>(null)
  const [error, setError] = useState<{ kind: string; text: string } | null>(null)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { hist } = useStore()
  const history = hist.filter(h => h.toolId === toolId).slice(0, 20)
  const hasX = /\bx\b/i.test(expr)
  const vars = ans === null ? {} : { ans }
  const preview = useMemo(() => { if (!expr.trim() || hasX) return ''; const r = evaluate(expr, mode, vars); return r.ok ? show(r.value) : '' }, [expr, mode, ans, hasX]) // eslint-disable-line

  const insert = (t: string) => {
    const el = ref.current, a = el?.selectionStart ?? expr.length, b = el?.selectionEnd ?? expr.length
    setExpr(expr.slice(0, a) + t + expr.slice(b)); setError(null); setCopied(false)
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(a + t.length, a + t.length) })
  }
  const current = (): number | null => { if (result) return Number(result); const r = evaluate(expr, mode, vars); return r.ok ? r.value : null }
  const equals = () => {
    if (!expr.trim()) return
    if (hasX) return setError({ kind: 'Contém a variável x', text: 'A calculadora avalia números. Envie esta expressão ao módulo de gráficos.' })
    const r = evaluate(expr, mode, vars)
    if (!r.ok) { setError({ kind: MATH_ERR.test(r.error) ? 'Indefinido matematicamente' : 'Erro de sintaxe', text: r.error }); setResult(''); return }
    setError(null); setResult(show(r.value)); setAns(r.value); setCopied(false)
    actions.record({ toolId, inputs: { expr, mode }, summary: `${expr} = ${show(r.value)}` })
  }
  const press = (k: Key) => {
    if (k.act === 'eq') return equals()
    if (k.act === 'ac') { setExpr(''); setResult(''); setError(null); return ref.current?.focus() }
    if (k.act === 'del') { const el = ref.current, a = el?.selectionStart ?? expr.length, b = el?.selectionEnd ?? expr.length
      const from = a === b ? Math.max(0, a - 1) : a; setExpr(expr.slice(0, from) + expr.slice(b)); setResult(''); return requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(from, from) }) }
    if (second && k.alt) { setSecond(false); return insert(k.alt.ins) }
    insert(k.ins ?? k.l)
  }
  const memory = (m: string) => {
    if (m === 'MC') return setMem(null)
    if (m === 'MR') return mem !== null && insert(show(mem))
    const c = current(); if (c === null) return setError({ kind: 'Memória', text: 'Calcule uma expressão válida antes de usar a memória.' })
    setMem(m === 'MS' ? c : (mem ?? 0) + (m === 'M+' ? c : -c))
  }
  const copy = () => navigator.clipboard?.writeText(result).then(() => setCopied(true), () => setCopied(false))
  const label = (k: Key) => (second && k.alt ? k.alt.l : k.l)

  return (
    <div className="calc sci">
      <div className="display" aria-live="polite">
        <div className="status"><span>{mode === 'deg' ? 'DEG' : 'RAD'}</span>{mem !== null && <span>M = {show(mem)}</span>}{second && <span>2nd</span>}{ans !== null && <span>ANS = {show(ans)}</span>}</div>
        <input ref={ref} aria-label="Expressão" className="expr" value={expr} spellCheck={false} autoComplete="off" inputMode="text"
          onChange={e => { setExpr(e.target.value); setResult(''); setError(null) }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); equals() } else if (e.key === 'Escape') press({ l: 'AC', act: 'ac' }) }}
          placeholder={scientific ? 'sin(30) + sqrt(16)^2 / 5!' : '(2 + 3) * 4 / 5'} />
        <div className={`res ${error ? 'bad' : ''}`}>{error ? <><strong>{error.kind}</strong><span>{error.text}</span></> : result || (preview ? <span className="muted">{preview}</span> : '0')}</div>
      </div>
      <div className="actions">
        <button onClick={copy} disabled={!result}>{copied ? 'Copiado ✓' : 'Copiar resultado'}</button>
        <button onClick={() => nav('/ferramenta/grafico-funcoes', { state: { inputs: { f1: expr } } })} disabled={!hasX}>Enviar ao gráfico</button>
      </div>
      <div className="keys mem">{MEM.map(m => <button key={m} onClick={() => memory(m)} aria-label={`Memória ${m}`}>{m}</button>)}</div>
      {scientific && <div className="keys mem">
        <button aria-pressed={second} onClick={() => setSecond(s => !s)}>2nd</button>
        <button aria-pressed={mode === 'deg'} onClick={() => setMode(m => (m === 'deg' ? 'rad' : 'deg'))}>{mode === 'deg' ? 'DEG' : 'RAD'}</button>
      </div>}
      {scientific && <div className="keys fn">{FN.flat().map(k => <button key={k.l} className={second && k.alt ? 'alt' : ''} onClick={() => press(k)}>{label(k)}</button>)}</div>}
      <div className="keys pad">{PAD.flat().map(k => <button key={k.l} className={k.cls ?? ''} onClick={() => press(k)} aria-label={k.l === '⌫' ? 'Apagar' : k.l === 'AC' ? 'Limpar tudo' : undefined}>{k.l}</button>)}</div>
      <p className="muted">Digite no visor ou use o teclado. Enter calcula e Esc limpa. <strong>%</strong> divide por 100 (200*10% = 20). Resultados são aproximações de ponto flutuante (≈15 dígitos); em radianos, valores como sin(π) aparecem arredondados a 0 abaixo de 10⁻¹².</p>
      <h2>Histórico</h2>
      {history.length === 0 ? <p className="empty">Nenhuma expressão calculada ainda.</p> :
        <ul className="hist">{history.map(h => <li key={h.id}><button onClick={() => { setExpr(h.inputs.expr ?? ''); if (h.inputs.mode === 'rad' || h.inputs.mode === 'deg') setMode(h.inputs.mode); setResult('') }}>{h.summary}</button></li>)}</ul>}
    </div>
  )
}
