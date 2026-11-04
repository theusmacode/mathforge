import type { Field, Result, ToolModule, Values } from '../../core/types.ts'
import type { Tool } from '../../registry/types.ts'
import { fmt } from '../../core/format.ts'
export interface Def { meta: Omit<Tool, 'status'>; mod: ToolModule }
/** "id|Rótulo|unidade|flags" — flags: o (opcional), t (texto), m (texto multilinha). */
export const F = (spec: string): Field => { const [id, label, unit, fl = ''] = spec.split('|')
  return { id, label, ...(unit ? { unit } : {}), ...(fl.includes('o') ? { optional: true } : {}), ...(/[tmxy]/.test(fl) ? { text: true } : {}), ...(fl.includes('m') ? { multiline: true } : {}), ...(fl.includes('x') ? { matrix: 'plain' as const } : {}), ...(fl.includes('y') ? { matrix: 'aug' as const } : {}) } }
export const SEL = (id: string, label: string, opts: string[]): Field => ({ id, label, options: opts.map((l, i) => ({ value: i, label: l })) })
export const err = (error: string): Result => ({ ok: false, error })
export const n = (x: number, d = 8) => fmt(x, d)
export const res = (outputs: [string, string][], formulas: string[] = [], steps: string[] = [], notes?: string[], table?: { head: string[]; rows: string[][] }): Result =>
  ({ ok: true, outputs: outputs.map(([label, value]) => ({ label, value })), formulas, steps, ...(notes ? { notes } : {}), ...(table ? { table } : {}) })
/** Devolve um erro de validação se alguma condição falhar. */
export const chk = (...c: [boolean, string][]): Result | null => { const f = c.find(([bad]) => bad); return f ? err(f[1]) : null }
export const def = (id: string, name: string, category: string, subcategory: string, glyph: string, description: string, keywords: string[], fields: Field[],
  compute: (v: Values, t: Record<string, string>) => Result): Def => ({ meta: { id, name, category, subcategory, glyph, description, keywords }, mod: { fields, compute: (v, t) => { try { return compute(v, t ?? {}) } catch (e) { return err(e instanceof Error ? e.message : 'Entrada inválida.') } } } })
export const list = (s: string): number[] => { const t = s.split(/;|\n|\s+/).map(x => x.replace(/^,+|,+$/g, '')).filter(Boolean)
  if (!t.length) throw new Error('Informe os valores.'); return t.map(x => { if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?$/.test(x)) throw new Error(`Valor inválido: “${x}”.`); return Number(x.replace(',', '.')) }) }
