import { Link } from 'react-router-dom'
export default function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Você está em">
      {items.map((i, n) => (
        <span key={n}>{i.to ? <Link to={i.to}>{i.label}</Link> : <span aria-current="page">{i.label}</span>}{n < items.length - 1 && ' / '}</span>
      ))}
    </nav>
  )
}
