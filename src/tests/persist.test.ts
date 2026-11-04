import { describe, it, expect } from 'vitest'
import { parseFavorites, parseHistory, toggleFav, addHistory, removeHistory, serialize, MAX_HISTORY, type HistoryEntry } from '../core/persist.ts'
const e = (id: string, v = '1'): HistoryEntry => ({ id, toolId: 't', at: '2026-01-01T00:00:00Z', inputs: { x: v }, summary: 's' })
describe('persistência', () => {
  it('favoritos: ida e volta, sem duplicatas', () => { expect(parseFavorites(serialize(['a', 'b', 'a']))).toEqual(['a', 'b']) })
  it('toggle adiciona e remove', () => { expect(toggleFav([], 'a')).toEqual(['a']); expect(toggleFav(['a'], 'a')).toEqual([]) })
  it('dados corrompidos, nulos, versão antiga ou tipo errado viram lista vazia', () => {
    for (const raw of [null, '', '{', 'null', '{"v":0,"data":[]}', '{"v":1,"data":"x"}', '[]']) { expect(parseFavorites(raw)).toEqual([]); expect(parseHistory(raw)).toEqual([]) }
  })
  it('histórico descarta entradas inválidas e mantém as válidas', () => {
    const raw = serialize([e('1'), { id: 2 }, { ...e('3'), at: 'xx' }, { ...e('4'), inputs: { x: 5 } }, e('5')])
    expect(parseHistory(raw).map(x => x.id)).toEqual(['1', '5'])
  })
  it('mais recentes primeiro; repetição idêntica consecutiva não duplica', () => {
    let h: HistoryEntry[] = []; h = addHistory(h, e('1')); h = addHistory(h, e('2', '1')); expect(h.length).toBe(1)
    h = addHistory(h, e('3', '9')); expect(h.map(x => x.id)).toEqual(['3', '1'])
  })
  it('limite de tamanho e remoção individual', () => {
    let h: HistoryEntry[] = []; for (let i = 0; i < MAX_HISTORY + 5; i++) h = addHistory(h, e(String(i), String(i)))
    expect(h.length).toBe(MAX_HISTORY); expect(removeHistory(h, h[0].id).length).toBe(MAX_HISTORY - 1)
  })
})
