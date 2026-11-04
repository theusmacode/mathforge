import type { Category } from './types.ts'
export const categories: Category[] = [
  { id: 'basica', name: 'Matemática básica', glyph: '÷', hue: '#00B981', description: 'Operações, porcentagem, frações e conversões.', subcategories: ['Calculadoras', 'Proporção', 'Frações', 'Números inteiros', 'Conversões'] },
  { id: 'comercial', name: 'Porcentagem e comercial', glyph: '%', hue: '#00B981', description: 'Variações, descontos, margem e markup.', subcategories: ['Variações', 'Preços'] },
  { id: 'algebra', name: 'Álgebra', glyph: 'x²', hue: '#00B981', description: 'Equações, polinômios, matrizes e sistemas.', subcategories: ['Equações', 'Polinômios', 'Matrizes'] },
  { id: 'funcoes', name: 'Funções e gráficos', glyph: 'ƒ', hue: '#00B981', description: 'Funções afim, quadrática, exponencial e mais.', subcategories: ['Funções', 'Gráficos'] },
  { id: 'geometria-plana', name: 'Geometria plana', glyph: '△', hue: '#00B981', description: 'Triângulos, círculos, polígonos e Pitágoras.', subcategories: ['Triângulos', 'Figuras planas'] },
  { id: 'geometria-espacial', name: 'Geometria espacial', glyph: '⬡', hue: '#00B981', description: 'Volumes e áreas de sólidos.', subcategories: ['Sólidos'] },
  { id: 'trigonometria', name: 'Trigonometria', glyph: 'θ', hue: '#00B981', description: 'Seno, cosseno, tangente e resolução de triângulos.', subcategories: ['Razões', 'Leis'] },
  { id: 'financeira', name: 'Matemática financeira', glyph: '%', hue: '#00B981', description: 'Juros, amortização, financiamentos e investimentos.', subcategories: ['Juros', 'Financiamentos', 'Investimentos'] },
  { id: 'estatistica', name: 'Estatística e probabilidade', glyph: 'σ', hue: '#00B981', description: 'Medidas, combinatória, distribuições e regressão.', subcategories: ['Descritiva', 'Probabilidade'] },
  { id: 'calculo', name: 'Cálculo', glyph: '∫', hue: '#00B981', description: 'Limites, derivadas e integrais (etapa posterior).', subcategories: ['Derivadas', 'Integrais', 'Limites', 'Raízes'] },
  { id: 'discreta', name: 'Matemática discreta e lógica', glyph: '∧', hue: '#00B981', description: 'Lógica, conjuntos e aritmética modular.', subcategories: ['Lógica', 'Conjuntos', 'Aritmética', 'Sequências', 'Sistemas numéricos'] },
  { id: 'fisica', name: 'Física aplicada', glyph: 'F=ma', hue: '#00B981', description: 'Movimento, força, energia e unidades físicas.', subcategories: ['Cinemática', 'Dinâmica', 'Eletricidade'] },
]
