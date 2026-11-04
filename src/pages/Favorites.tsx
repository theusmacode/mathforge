import { useStore } from '../features/store'
import { getTool } from '../registry/tool-registry'
import ToolCardList from '../components/ToolCardList'
import type { Tool } from '../registry/types'
export default function Favorites() {
  const { fav } = useStore()
  const tools = fav.map(getTool).filter((t): t is Tool => !!t && t.status === 'available')
  return <div className="page"><h1>Favoritos</h1>
    <ToolCardList tools={tools} empty="Nenhum favorito ainda. Abra uma ferramenta disponível e use “Favoritar”." /></div>
}
