import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { getTool } from '../registry/tool-registry'
import { categories } from '../registry/category-registry'
import { customTools } from '../features/modules'
import { actions, useStore } from '../features/store'
import { KINDS, kindOf } from '../features/kinds'
import Breadcrumbs from '../components/Breadcrumbs'
import Calculator from '../features/Calculator'
import Grapher from '../features/Grapher'
import ToolShell from '../features/ToolShell'
import NotFound from './NotFound'

export default function ToolPage() {
  const { id } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const { fav } = useStore()
  const tool = id ? getTool(id) : undefined
  if (!tool) return <NotFound />
  const cat = categories.find(c => c.id === tool.category)!
  const initial = ((loc.state as { inputs?: Record<string, string> } | null)?.inputs) ?? {}
  const isFav = fav.includes(tool.id), custom = customTools.includes(tool.id), key = tool.id + loc.key
  return (
    <div className="page wide" style={{ ['--hue' as string]: cat.hue }}>
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: cat.name, to: `/categoria/${cat.id}` }, { label: tool.name }]} />
      <header className="page-head tool-head">
        <div><p className="eyebrow">{custom ? (tool.id === 'grafico-funcoes' ? 'Área de trabalho' : 'Calculadora') : KINDS[kindOf(tool)].label}</p><h1>{tool.name}</h1><p className="muted">{tool.description}</p></div>
        {tool.status === 'available' && <button aria-pressed={isFav} onClick={() => actions.toggleFavorite(tool.id)}>{isFav ? '★ Nos favoritos' : '☆ Favoritar'}</button>}
      </header>
      {tool.status !== 'available' ? <div className="empty"><strong>Ferramenta ainda não implementada.</strong><p>Está registrada no catálogo e aparece como planejada.</p></div>
        : tool.id === 'grafico-funcoes' ? <Grapher key={key} initial={initial} />
        : custom ? <Calculator key={key} toolId={tool.id} scientific={tool.id === 'calculadora-cientifica'} initial={initial} />
        : <ToolShell key={key} tool={tool} initial={initial} openGraph={expr => nav('/ferramenta/grafico-funcoes', { state: { inputs: { f1: expr } } })} />}
    </div>
  )
}
