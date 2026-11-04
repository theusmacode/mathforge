import { useState } from 'react'

const parse = (s: string): string[][] => { const r = s.split(/;|\n/).map(x => x.trim()).filter(Boolean).map(x => x.split(/[\s,]+/).filter(Boolean)); return r.length ? r : [['0']] }
const compose = (c: string[][]) => c.map(r => r.map(x => (x.trim() === '' ? '0' : x)).join(' ')).join('; ')
export default function MatrixGrid({ label, value, onChange, aug }: { label: string; value: string; onChange: (v: string) => void; aug?: boolean }) {
  const [cells, setCells] = useState<string[][]>(() => { const c = parse(value), w = Math.max(...c.map(r => r.length)); return c.map(r => [...r, ...Array(w - r.length).fill('0')]) })
  const [text, setText] = useState(false)
  const rows = cells.length, cols = cells[0].length, minC = aug ? 2 : 1
  const commit = (c: string[][]) => { setCells(c); onChange(compose(c)) }
  const resize = (r: number, c: number) => { r = Math.min(8, Math.max(1, r)); c = Math.min(aug ? 9 : 8, Math.max(minC, c)); commit(Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => cells[i]?.[j] ?? '0'))) }
  const set = (i: number, j: number, v: string) => commit(cells.map((r, a) => r.map((x, b) => (a === i && b === j ? v : x))))
  const Step = ({ name, v, on }: { name: string; v: number; on: (n: number) => void }) => (<span className="stepper"><button type="button" aria-label={`Diminuir ${name}`} onClick={() => on(v - 1)}>−</button><output aria-label={name}>{v}</output><button type="button" aria-label={`Aumentar ${name}`} onClick={() => on(v + 1)}>+</button></span>)
  return (
    <div className="mgrid">
      <div className="mgrid-head"><strong>{label}</strong><span className="muted">{rows}×{cols}{aug ? ` (${cols - 1} incógnitas + b)` : ''}</span>
        <span className="mgrid-ctl"><span>Linhas</span><Step name="linhas" v={rows} on={n => resize(n, cols)} /><span>Colunas</span><Step name="colunas" v={cols} on={n => resize(rows, n)} />
          <button type="button" className="linkish" aria-pressed={text} onClick={() => { if (text) setCells(parse(value).map(r => r)); setText(t => !t) }}>{text ? 'Usar grade' : 'Entrada em texto'}</button></span></div>
      {text ? <textarea rows={3} aria-label={`${label} em texto`} value={value} onChange={e => { onChange(e.target.value); const c = parse(e.target.value), w = Math.max(...c.map(r => r.length)); setCells(c.map(r => [...r, ...Array(w - r.length).fill('0')])) }} />
        : <div className="mgrid-cells" style={{ gridTemplateColumns: `repeat(${cols}, minmax(52px, 76px))` }} role="group" aria-label={label}>
          {cells.map((r, i) => r.map((x, j) => <input key={`${i}-${j}`} inputMode="decimal" className={aug && j === cols - 1 ? 'bcol' : ''} aria-label={`${label}, linha ${i + 1}, ${aug && j === cols - 1 ? 'termo independente b' : `coluna ${j + 1}`}`} value={x} onFocus={e => e.target.select()} onChange={e => set(i, j, e.target.value)} />))}</div>}
    </div>
  )
}
