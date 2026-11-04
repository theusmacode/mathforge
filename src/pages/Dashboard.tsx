import { Link } from 'react-router-dom'
import { categories } from '../registry/category-registry'
import { tools, toolsByCategory, getTool, toolPath } from '../registry/tool-registry'
import ToolCard from '../components/ToolCard'
import ToolCardList from '../components/ToolCardList'
import { useStore } from '../features/store'
import type { Tool } from '../registry/types'

const ok = (t?: Tool): t is Tool => !!t && t.status === 'available'
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' }

export default function Dashboard() {
  const { fav, hist } = useStore()
  const available = tools.filter(ok)
  const favs = fav.map(getTool).filter(ok)
  const recent = [...new Set(hist.map(h => h.toolId))].map(getTool).filter(ok).slice(0, 5)
  const starters = ['calculadora-cientifica', 'grafico-funcoes', 'juros-compostos', 'estatistica-descritiva'].map(getTool).filter(ok)
  const stats = [
    ['Ferramentas disponíveis', `${available.length}`, `${tools.length - available.length} planejadas`],
    ['Áreas', `${categories.length}`, `${categories.filter(c => toolsByCategory(c.id).some(ok)).length} com ferramentas`],
    ['Favoritos', `${favs.length}`, favs.length ? 'salvos neste navegador' : 'nenhum ainda'],
    ['Cálculos salvos', `${hist.length}`, hist.length ? 'no histórico' : 'nenhum ainda'],
  ]
  return (
    <div className="page">
      <header className="page-head">
        <div><p className="eyebrow">{greeting()}</p><h1>Painel</h1><p className="muted">Escolha uma ferramenta ou busque pelo campo acima.</p></div>
        <div className="actions"><Link className="btn" to="/ferramenta/calculadora-cientifica">Calculadora</Link><Link className="btn primary-link" to="/ferramenta/grafico-funcoes">Gráficos</Link></div>
      </header>

      <div className="stats">{stats.map(([l, v, s]) => <div key={l} className="stat"><span>{l}</span><strong>{v}</strong><small>{s}</small></div>)}</div>

      <div className="split">
        <div>
          {favs.length > 0 && <section><h2>Favoritos</h2><ToolCardList tools={favs.slice(0, 5)} empty="" /></section>}
          {recent.length > 0 && <section><h2>Usadas recentemente</h2><ToolCardList tools={recent} empty="" /></section>}
          {favs.length === 0 && recent.length === 0 && (
            <section><h2>Para começar</h2>
              <p className="muted">Você ainda não tem favoritos nem cálculos. Estas ferramentas são um bom ponto de partida:</p>
              <div className="list">{starters.map(t => <ToolCard key={t.id} tool={t} />)}</div></section>)}
          <section><div className="row-between"><h2>Histórico recente</h2>{hist.length > 0 && <Link to="/historico">Ver tudo</Link>}</div>
            {hist.length === 0 ? <p className="empty">Os cálculos que você fizer aparecerão aqui.</p> :
              <ul className="hist">{hist.slice(0, 5).map(h => { const t = getTool(h.toolId)
                return <li key={h.id} className="hist-row"><div><strong>{t?.name ?? h.toolId}</strong><div className="muted">{h.summary}</div></div>
                  {t && <Link className="btn" to={toolPath(t)} state={{ inputs: h.inputs }}>Reabrir</Link>}</li> })}</ul>}
          </section>
        </div>
        <aside aria-label="Categorias"><h2>Categorias</h2>
          <ul className="catlist">{categories.map(c => { const all = toolsByCategory(c.id).length, on = toolsByCategory(c.id).filter(ok).length
            return <li key={c.id}><Link to={`/categoria/${c.id}`}><span className="glyph" aria-hidden>{c.glyph}</span><span className="grow">{c.name}</span><small>{on}/{all}</small></Link></li> })}</ul>
        </aside>
      </div>

      <h2>Estado por área</h2>
      <div className="table-wrap"><table className="areas">
        <caption className="sr-only">Ferramentas por área e estado de implementação</caption>
        <thead><tr><th>Área</th><th>Disponíveis</th><th>Planejadas</th><th>Total</th><th>Progresso</th><th>Estado</th></tr></thead>
        <tbody>{categories.map(c => { const all = toolsByCategory(c.id).length, on = toolsByCategory(c.id).filter(ok).length
          const st = all === 0 ? ['Sem ferramentas', 'empty'] : on === all ? ['Completa', 'done'] : on === 0 ? ['Planejada', 'plan'] : ['Em andamento', 'wip']
          return <tr key={c.id}><td><Link to={`/categoria/${c.id}`}>{c.name}</Link></td><td>{on}</td><td>{all - on}</td><td>{all}</td>
            <td><div className="meter" role="img" aria-label={`${all ? Math.round((on / all) * 100) : 0}% disponível`}><span style={{ width: `${all ? (on / all) * 100 : 0}%` }} /></div></td>
            <td><span className={`badge ${st[1]}`}>{st[0]}</span></td></tr> })}</tbody></table></div>
    </div>
  )
}
