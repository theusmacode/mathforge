import type { Field, Result, Values } from '../../core/types.ts'
import { modules } from '../modules.ts'
import { SPECS } from './specs.ts'
import { UNIT_ALTS } from './units.ts'

export const num = (s: string) => { const t = s.trim().replace(',', '.'); return t === '' ? undefined : Number(t) }
export const defaultOf = (f: Field) => (f.options ? String(f.options[0].value) : '')
export const altsOf = (id: string, f: Field) => (SPECS[id]?.units && f.unit && !f.text && !f.options ? UNIT_ALTS[f.unit] : undefined)
export type Run = { res: Result | null; error: string | null }
/** Lê os campos (já na unidade escolhida), converte para o SI e chama o cálculo existente. */
export function runTool(id: string, raw: Record<string, string>, units: Record<string, number> = {}): Run {
  const mod = modules[id], v: Values = {}, t: Record<string, string> = {}; let converted = false
  for (const f of mod.fields) {
    const s = raw[f.id] ?? defaultOf(f)
    if (f.text) { if (!s.trim() && !f.optional) return { res: null, error: `Preencha “${f.label}”.` }; t[f.id] = s.trim(); continue }
    const n = num(s)
    if (n === undefined) { if (!f.optional) return { res: null, error: `Preencha “${f.label}”.` }; v[f.id] = undefined; continue }
    if (!Number.isFinite(n)) return { res: null, error: `“${f.label}” não é um número válido.` }
    const a = altsOf(id, f), k = a ? a[units[f.id] ?? 0][1] : 1
    if (k !== 1) converted = true
    v[f.id] = n * k
  }
  const res = mod.compute(v, t)
  if (!res.ok) return { res: null, error: res.error }
  return { res: converted ? { ...res, notes: [...(res.notes ?? []), 'Entradas convertidas para o SI antes do cálculo; os resultados estão em unidades SI.'] } : res, error: null }
}
