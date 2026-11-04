import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { categories } from '../registry/category-registry'
import { toolsByCategory, searchTools } from '../registry/tool-registry'
import Breadcrumbs from '../components/Breadcrumbs'
import ToolCard from '../components/ToolCard'
import NotFound from './NotFound'

export default function CategoryPage() {
  const { id } = useParams()
  const cat = categories.find(c => c.id === id)
  const [q, setQ] = useState('')
  const [onlyOn, setOnlyOn] = useState(false)
  if (!cat) return <NotFound />
  const all = toolsByCategory(cat.id), on = all.filter(t => t.status === 'available').length
  const shown = (q.trim() ? searchTools(q).filter(t => t.category === cat.id) : all).filter(t => !onlyOn || t.status === 'available')
  const groups = cat.subcategories.map(s => ({ s, items: shown.filter(t => t.subcategory === s) })).filter(g => g.items.length)
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: cat.name }]} />
      <header className="page-head"><div><h1>{cat.name}</h1><p className="muted">{cat.description}</p></div>
        <div className="stat compact"><span>Disponíveis</span><strong>{on}<small> de {all.length}</small></strong></div></header>
      <div className="toolbar">
        <input className="inline-search" type="search" aria-label={`Buscar em ${cat.name}`} placeholder={`Buscar em ${cat.name}`} value={q} onChange={e => setQ(e.target.value)} />
        <button aria-pressed={onlyOn} onClick={() => setOnlyOn(o => !o)}>Só disponíveis</button>
      </div>
      {shown.length === 0
        ? <p className="empty">{all.length === 0 ? 'Esta área ainda não tem ferramentas registradas.' : 'Nenhuma ferramenta corresponde ao filtro.'}</p>
        : groups.map(g => <section key={g.s}><h2>{g.s} <span className="muted">· {g.items.length}</span></h2><div className="list two">{g.items.map(t => <ToolCard key={t.id} tool={t} />)}</div></section>)}
    </div>
  )
}
