import { useSyncExternalStore } from 'react'
import { parseFavorites, parseHistory, toggleFav, addHistory, removeHistory, serialize, type HistoryEntry } from '../core/persist'

const FK = 'mathforge.favorites', HK = 'mathforge.history'
const get = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const set = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* armazenamento indisponível: segue só em memória */ } }

let state = { fav: parseFavorites(get(FK)), hist: parseHistory(get(HK)) }
const listeners = new Set<() => void>()
const commit = (n: Partial<typeof state>) => {
  state = { ...state, ...n }; set(FK, serialize(state.fav)); set(HK, serialize(state.hist)); listeners.forEach(l => l())
}
const sub = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }
export const useStore = () => useSyncExternalStore(sub, () => state)
export const actions = {
  toggleFavorite: (id: string) => commit({ fav: toggleFav(state.fav, id) }),
  record: (e: Pick<HistoryEntry, 'toolId' | 'inputs' | 'summary'>) =>
    commit({ hist: addHistory(state.hist, { ...e, id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, at: new Date().toISOString() }) }),
  remove: (id: string) => commit({ hist: removeHistory(state.hist, id) }),
  clearHistory: () => commit({ hist: [] }),
}
