/* Renderiza no servidor a ToolShell de cada ferramenta e gera o inventário.
 * Uso (após `npm install`): npx tsx scripts/smoke-render.tsx [--inventory INVENTARIO.md]
 * Não substitui o teste no navegador: verifica apenas que cada interface renderiza sem erro e com os componentes previstos. */
import { renderToString } from 'react-dom/server'
import { writeFileSync } from 'node:fs'
import ToolShell from '../src/features/ToolShell'
import { tools } from '../src/registry/tool-registry'
import { categories } from '../src/registry/category-registry'
import { modules, customTools } from '../src/features/modules'
import { exampleFor, MATRIX_DEFAULTS } from '../src/features/kinds'
import { SPECS } from '../src/features/ui/specs'
import { runTool } from '../src/features/ui/run'

/** Entradas válidas para ferramentas cujo domínio não aceita o preenchimento genérico. */
const SAMPLES: Record<string, Record<string, string>> = {
  fracoes: { n1: '1', d1: '2', op: '1', n2: '1', d2: '3' }, 'lei-ohm': { V: '12', I: '', R: '4' }, 'bases-numericas': { v: 'FF', b: '16' }, pitagoras: { a: '3', b: '4', c: '' },
  'probabilidade-uniao': { a: '0.5', b: '0.4', i: '0.2' }, 'probabilidade-condicional': { i: '0.2', b: '0.4', a: '' }, 'teorema-bayes': { a: '0.01', s: '0.9', f: '0.09' },
  'distribuicao-binomial': { n: '10', p: '0.5', k: '5' }, 'triangulo-retangulo-resolver': { a: '3', b: '4', c: '', A: '' }, 'triangulo-ssa': { a: '5', b: '8', c: '30' },
}
const initialOf = (id: string) => { const i: Record<string, string> = {}; for (const f of modules[id].fields) i[f.id] = f.matrix ? MATRIX_DEFAULTS[f.matrix] : f.text ? (exampleFor(id, f.id) ?? '1 2 3') : f.options ? String(f.options[0].value) : '3'; return { ...i, ...(SAMPLES[id] ?? {}) } }
const EDITOR_NAME: Record<string, string> = { chips: 'ChipsEditor', 'chips,': 'ChipsEditor', coeffs: 'CoeffEditor', ops: 'OpsEditor (conectivos)', expr: 'ExprEditor (teclado de funções)' }
const rows: string[][] = [], sigs = new Set<string>(), failed: string[] = []
const av = tools.filter(t => t.status === 'available')
for (const t of av) {
  const spec = SPECS[t.id], cat = categories.find(c => c.id === t.category)!.name
  if (customTools.includes(t.id)) { rows.push([t.name, t.id, cat, 'Interface própria', t.id === 'grafico-funcoes' ? 'Grapher' : 'Calculator', spec.extras?.join('; ') ?? '', '—', 'preservada (testes do motor; UI não exercitada aqui)']); sigs.add(`custom|${t.id}`); continue }
  let ok = '✓'; let vis = '—'; let htmlOk = false
  try { const h = renderToString(<ToolShell tool={t} initial={initialOf(t.id)} />); htmlOk = h.includes('class="kpis"') || h.includes('matrix-view') } catch (e) { failed.push(`${t.id}: ${(e as Error).message}`); ok = '✗' }
  const r = runTool(t.id, initialOf(t.id)).res; if (r && r.ok) vis = [r.chart?.kind === 'shape' ? `figura:${(r.chart as { shape: string }).shape}` : r.chart?.kind, r.charts ? 'duas soluções' : '', r.compare ? 'comparação' : '', r.table ? 'tabela' : ''].filter(Boolean).join(' + ') || '—'
  const comps = [spec.layout === 'matrixop' ? 'MatrixGrid × operação' : 'EquationBar (enunciado interativo)', ...new Set(Object.values(spec.editors ?? {}).map(e => (e.startsWith('pairs:') ? 'PairsEditor' : EDITOR_NAME[e]))), ...(spec.sliders ? ['Sliders'] : []), ...(spec.units ? ['UnitSelect (SI)'] : []), ...(vis !== '—' ? ['ChartView/ShapeView'] : [])]
  sigs.add([spec.layout, Object.values(spec.editors ?? {}).join(','), Object.keys(spec.sliders ?? {}).join(','), spec.units, vis].join('|'))
  rows.push([t.name, t.id, cat, spec.layout, comps.join(', '), spec.extras?.join('; ') ?? '', vis, `${ok} render${htmlOk ? ' com resultado' : ' (estado vazio)'}`])
}
console.log(`ferramentas: ${av.length} | falhas de renderização: ${failed.length} ${failed.join(' | ')}`)
console.log(`sem resultado no smoke: ${rows.filter(r => r[7].includes('vazio')).map(r => r[1]).join(', ') || 'nenhuma'}`)
console.log(`composições distintas (layout+editores+sliders+unidades+visual): ${sigs.size}`)
const out = process.argv.indexOf('--inventory')
if (out > 0) {
  const head = '| Ferramenta | id | Área | Layout | Componentes | Interações | Visualização | Verificação |\n|---|---|---|---|---|---|---|---|\n'
  writeFileSync(process.argv[out + 1], `# Inventário de interfaces — ${av.length} ferramentas\n\nGerado por \`scripts/smoke-render.tsx\` a partir de \`src/features/ui/specs.ts\`.\nComposições distintas (layout + editores + sliders + unidades + tipo de visual): **${sigs.size}**. Enunciados únicos: **${new Set(av.map(t => SPECS[t.id].sentence).filter(Boolean)).size}**.\n\n**Verificação**: “render” = a interface renderizou no servidor sem erro (react-dom/server) com entradas de exemplo; o cálculo de cada ferramenta é coberto pela suíte de testes da lógica. Nenhuma foi inspecionada num navegador.\n\n${head}${rows.map(r => `| ${r.join(' | ')} |`).join('\n')}\n`)
}
