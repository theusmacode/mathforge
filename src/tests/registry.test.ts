import { describe, it, expect } from 'vitest'
import { tools, searchTools } from '../registry/tool-registry.ts'
import { categories } from '../registry/category-registry.ts'

describe('registro', () => {
  it('ids de ferramentas são únicos', () => {
    expect(new Set(tools.map(x => x.id)).size).toBe(tools.length)
  })
  it('toda ferramenta aponta para categoria e subcategoria existentes', () => {
    for (const x of tools) {
      const c = categories.find(c => c.id === x.category)
      expect(c, x.id).toBeDefined()
      expect(c!.subcategories, x.id).toContain(x.subcategory)
    }
  })
})
describe('busca', () => {
  it('"juros" encontra as ferramentas financeiras', () => {
    const ids = searchTools('juros').map(x => x.id)
    expect(ids).toContain('juros-simples'); expect(ids).toContain('juros-compostos')
  })
  it('ignora acentos e maiúsculas', () => { expect(searchTools('TRIANGULO').length).toBeGreaterThan(0) })
  it('consulta vazia ou sem resultado retorna lista vazia', () => {
    expect(searchTools('  ')).toEqual([]); expect(searchTools('zzzzqq')).toEqual([])
  })
})
