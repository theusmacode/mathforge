import { Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import Dashboard from '../pages/Dashboard'
import CategoryPage from '../pages/CategoryPage'
import ToolPage from '../pages/ToolPage'
import Favorites from '../pages/Favorites'
import History from '../pages/History'
import NotFound from '../pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="categoria/:id" element={<CategoryPage />} />
        <Route path="ferramenta/:id" element={<ToolPage />} />
        <Route path="favoritos" element={<Favorites />} />
        <Route path="historico" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
