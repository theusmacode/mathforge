import type { Tool } from '../registry/types.ts'
/** Modelo de interface de cada ferramenta, escolhido pela FINALIDADE (não só pela categoria). */
export type Kind = 'calc' | 'finance' | 'matrix' | 'stats' | 'algebra' | 'geometry' | 'physics' | 'analysis'
export interface KindInfo { label: string; inputs: string; layout: 'side' | 'stack' }
export const KINDS: Record<Kind, KindInfo> = {
  calc: { label: 'Calculadora numérica', inputs: 'Valores', layout: 'side' },
  finance: { label: 'Simulação financeira', inputs: 'Parâmetros financeiros', layout: 'side' },
  matrix: { label: 'Matrizes e sistemas', inputs: 'Matrizes', layout: 'stack' },
  stats: { label: 'Estatística e probabilidade', inputs: 'Dados', layout: 'side' },
  algebra: { label: 'Álgebra e lógica', inputs: 'Expressão e parâmetros', layout: 'side' },
  geometry: { label: 'Geometria e trigonometria', inputs: 'Medidas', layout: 'side' },
  physics: { label: 'Física', inputs: 'Grandezas', layout: 'side' },
  analysis: { label: 'Cálculo e análise', inputs: 'Função e parâmetros', layout: 'side' },
}
export function kindOf(t: Pick<Tool, 'id' | 'category'>): Kind {
  if (t.id.startsWith('matriz-') || t.id === 'sistema-linear' || t.id === 'regra-cramer') return 'matrix'
  switch (t.category) {
    case 'financeira': return 'finance'
    case 'estatistica': return 'stats'
    case 'geometria-plana': case 'geometria-espacial': case 'trigonometria': return 'geometry'
    case 'fisica': return 'physics'
    case 'calculo': return 'analysis'
    case 'algebra': case 'discreta': case 'funcoes': return 'algebra'
    default: return 'calc'
  }
}
/** Exemplos de entrada para campos de texto (botão "Usar exemplo"). Chave: id da ferramenta ou id do campo. */
const BY_TOOL: Record<string, Record<string, string>> = {
  'tabela-verdade': { e: '(p -> q) & (q -> r)' }, 'equivalencia-logica': { a: '!(p & q)', b: '!p | !q' }, conjuntos: { A: '1, 2, 3, 4', B: '3, 4, 5' }, 'bases-numericas': { v: 'FF' },
  derivada: { f: 'x^2 * sin(x)' }, 'integral-indefinida': { f: '3*x^2 + 2*x - 5' }, 'integral-definida': { f: 'sin(x)' }, 'limite-numerico': { f: 'sin(x)/x' }, 'raiz-newton': { f: 'x^2 - 2' },
  'correlacao-regressao': { x: '1 2 3 4 5 6', y: '2.1 3.9 6.2 7.8 10.1 12.2' }, 'polinomio-fatoracao': { p: '1 -6 11 -6' }, 'variacoes-sucessivas': { p: '-10 20 -5' },
}
const BY_FIELD: Record<string, string> = { p: '1 -3 2', q: '1 -1', d: '2 4 4 4 5 5 7 9', dados: '2 4 4 4 5 5 7 9', v: '8 6 7', w: '2 1 1', r: '6 3 2', e: '3 4 2' }
export const exampleFor = (toolId: string, fieldId: string): string | undefined => BY_TOOL[toolId]?.[fieldId] ?? BY_FIELD[fieldId]
export const MATRIX_DEFAULTS = { plain: '1 2; 3 4', aug: '2 1 5; 1 -1 1' }
