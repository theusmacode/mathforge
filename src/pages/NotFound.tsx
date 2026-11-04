import { Link } from 'react-router-dom'
export default function NotFound() {
  return <div className="page"><h1>Página não encontrada</h1><p className="muted">O endereço não existe ou a ferramenta foi removida.</p><Link to="/">Voltar ao início</Link></div>
}
