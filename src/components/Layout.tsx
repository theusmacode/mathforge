import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { categories } from '../registry/category-registry'
import { searchTools, toolPath } from '../registry/tool-registry'
import { APP_VERSION } from '../app/version'

function SearchBox() {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const results = searchTools(q).slice(0, 8)
  const go = (path: string) => { setQ(''); nav(path) }
  return (
    <div className="search">
      <input type="search" aria-label="Buscar ferramentas" placeholder="Buscar ferramentas: juros, derivada, matriz…" value={q} onChange={e => setQ(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') setQ(''); if (e.key === 'Enter' && results[0]) go(toolPath(results[0])) }} />
      {q.trim() && (
        <div className="search-pop" role="listbox">
          {results.length === 0 && <p className="muted pad">Nada encontrado para “{q}”.</p>}
          {results.map(r => (
            <button key={r.id} role="option" aria-selected={false} onClick={() => go(toolPath(r))}>
              <span className="glyph">{r.glyph}</span>
              <span><strong>{r.name}</strong><small>{categories.find(c => c.id === r.category)?.name}</small></span>
              {r.status === 'planned' && <em className="tag">planejada</em>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const personal = [{ to: '/', glyph: '⌂', name: 'Início', end: true }, { to: '/favoritos', glyph: '★', name: 'Favoritos' }, { to: '/historico', glyph: '↺', name: 'Histórico' }]

export default function Layout() {
  const [menu, setMenu] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={`shell ${menu ? 'menu-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar" aria-label="Navegação principal" onClick={() => setMenu(false)}>
        <NavLink to="/" className="brand" end aria-label="MathForge, início"><span className="logo" aria-hidden>∑</span><span className="label">MathForge</span></NavLink>
        <p className="nav-title label">Geral</p>
        <nav aria-label="Geral">
          {personal.map(i => <NavLink key={i.to} to={i.to} end={i.end} title={i.name}><span className="glyph" aria-hidden>{i.glyph}</span><span className="label">{i.name}</span></NavLink>)}
        </nav>
        <p className="nav-title label">Categorias</p>
        <nav aria-label="Categorias">
          {categories.map(c => <NavLink key={c.id} to={`/categoria/${c.id}`} title={c.name}><span className="glyph" aria-hidden>{c.glyph}</span><span className="label">{c.name}</span></NavLink>)}
        </nav>
        <p className="version label">Versão {APP_VERSION}</p>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="icon-btn burger" aria-label="Abrir menu" onClick={() => setMenu(m => !m)}>☰</button>
          <button className="icon-btn collapse" aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} aria-pressed={collapsed} onClick={() => setCollapsed(c => !c)}>⇤</button>
          <SearchBox />
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
