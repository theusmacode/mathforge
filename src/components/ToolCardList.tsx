import type { Tool } from '../registry/types'
import ToolCard from './ToolCard'
export default function ToolCardList({ tools, empty }: { tools: Tool[]; empty: string }) {
  return tools.length ? <div className="list">{tools.map(t => <ToolCard key={t.id} tool={t} />)}</div> : <p className="empty">{empty}</p>
}
