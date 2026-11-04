import { Link } from 'react-router-dom'
import type { Tool } from '../registry/types'
import { toolPath } from '../registry/tool-registry'
export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link to={toolPath(tool)} className="tool-card">
      <span className="glyph">{tool.glyph}</span>
      <span><strong>{tool.name}</strong><small>{tool.description}</small></span>
      <em className={`tag ${tool.status}`}>{tool.status === 'available' ? 'disponível' : 'planejada'}</em>
    </Link>
  )
}
