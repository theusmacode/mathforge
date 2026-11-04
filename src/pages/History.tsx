import { Link } from 'react-router-dom'
import { useStore, actions } from '../features/store'
import { getTool, toolPath } from '../registry/tool-registry'
export default function History() {
  const { hist } = useStore()
  const clear = () => { if (window.confirm('Apagar todo o histórico? Esta ação não pode ser desfeita.')) actions.clearHistory() }
  return (
    <div className="page"><h1>Histórico</h1>
      {hist.length === 0 ? <p className="empty">Nenhum cálculo registrado. Os cálculos feitos nas ferramentas aparecem aqui.</p> : (<>
        <button onClick={clear}>Limpar histórico</button>
        <ul className="hist">{hist.map(h => {
          const tool = getTool(h.toolId)
          return (
            <li key={h.id} className="hist-row">
              <div><strong>{tool?.name ?? h.toolId}</strong> <small className="muted">{new Date(h.at).toLocaleString('pt-BR')}</small>
                <div className="muted">{h.summary}</div></div>
              <div className="actions">
                {tool && tool.status === 'available' && <Link to={toolPath(tool)} state={{ inputs: h.inputs }} className="btn">Reabrir</Link>}
                <button aria-label={`Excluir registro de ${tool?.name ?? h.toolId}`} onClick={() => actions.remove(h.id)}>Excluir</button>
              </div>
            </li>)
        })}</ul></>)}
    </div>
  )
}
