/** Lógica pura de persistência (sem acesso a window): testável e tolerante a dados corrompidos. */
export const STORAGE_VERSION = 1
export const MAX_HISTORY = 200
export interface HistoryEntry { id: string; toolId: string; at: string; inputs: Record<string, string>; summary: string }

export const serialize = (data: unknown) => JSON.stringify({ v: STORAGE_VERSION, data })
const unwrap = (raw: string | null): unknown[] => {
  try { const o = JSON.parse(raw ?? ''); return o && o.v === STORAGE_VERSION && Array.isArray(o.data) ? o.data : [] } catch { return [] }
}
export const parseFavorites = (raw: string | null): string[] =>
  [...new Set(unwrap(raw).filter((x): x is string => typeof x === 'string'))]

const isEntry = (x: any): x is HistoryEntry =>
  x && typeof x.id === 'string' && typeof x.toolId === 'string' && typeof x.summary === 'string' &&
  typeof x.at === 'string' && !Number.isNaN(Date.parse(x.at)) && x.inputs && typeof x.inputs === 'object' &&
  Object.values(x.inputs).every(v => typeof v === 'string')
export const parseHistory = (raw: string | null): HistoryEntry[] => unwrap(raw).filter(isEntry).slice(0, MAX_HISTORY)

export const toggleFav = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])
const same = (a: HistoryEntry, b: HistoryEntry) => a.toolId === b.toolId && JSON.stringify(a.inputs) === JSON.stringify(b.inputs)
/** Mais recentes primeiro. Ignora repetição idêntica consecutiva (mesma ferramenta e entradas). */
export const addHistory = (list: HistoryEntry[], e: HistoryEntry): HistoryEntry[] =>
  list[0] && same(list[0], e) ? list : [e, ...list].slice(0, MAX_HISTORY)
export const removeHistory = (list: HistoryEntry[], id: string) => list.filter(x => x.id !== id)
