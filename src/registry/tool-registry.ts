import type { Tool, ToolStatus } from './types.ts'
import { allDefs } from '../features/defs/index.ts'
import { modules, customTools } from '../features/modules.ts'
import { categories } from './category-registry.ts'

const t = (id: string, name: string, category: string, subcategory: string, glyph: string, description: string, keywords: string[], status: ToolStatus = 'planned'): Tool =>
  ({ id, name, category, subcategory, glyph, description, keywords, status })

// Fase 1: todas "planejadas". Ao implementar uma ferramenta, mude o status para 'available'.
const raw: Tool[] = [
  t('calculadora-basica', 'Calculadora básica', 'basica', 'Calculadoras', '+', 'Operações fundamentais.', ['soma', 'subtração', 'multiplicação', 'divisão']),
  t('calculadora-cientifica', 'Calculadora científica', 'basica', 'Calculadoras', 'fx', 'Funções científicas e expressões.', ['seno', 'log', 'raiz']),
  t('fracoes', 'Operações com frações', 'basica', 'Frações', '½', 'Soma, subtração, multiplicação e divisão exatas.', ['fração', 'numerador', 'denominador']),
  t('simplificar-fracao', 'Simplificar fração', 'basica', 'Frações', '÷', 'Fração irredutível pelo MDC.', ['fração', 'irredutível']),
  t('mmc-mdc', 'MMC e MDC', 'basica', 'Números inteiros', 'mmc', 'Mínimo múltiplo comum e máximo divisor comum.', ['mdc', 'mínimo múltiplo']),
  t('fatoracao', 'Fatoração em primos', 'basica', 'Números inteiros', 'p', 'Decomposição em fatores primos e teste de primo.', ['primo', 'fatorar', 'divisores']),
  t('conversao-unidades', 'Conversão de unidades', 'basica', 'Conversões', '⇄', 'Comprimento, massa, tempo, área, volume, velocidade, ângulo e temperatura.', ['metro', 'quilômetro', 'celsius', 'fahrenheit', 'litro', 'grau']),
  t('variacao-percentual', 'Variação percentual', 'comercial', 'Variações', 'Δ%', 'Variação percentual entre dois valores.', ['aumento', 'queda', 'crescimento']),
  t('desconto-acrescimo', 'Desconto e acréscimo', 'comercial', 'Preços', '−%', 'Aplica desconto ou acréscimo a um valor.', ['preço', 'promoção']),
  t('valor-original', 'Valor original', 'comercial', 'Preços', '↶', 'Descobre o valor antes do desconto ou acréscimo.', ['preço original', 'antes do desconto']),
  t('margem-markup', 'Margem e markup', 'comercial', 'Preços', 'lucro', 'Lucro, margem sobre a venda e markup sobre o custo.', ['lucro', 'custo', 'venda']),
  t('grafico-funcoes', 'Construtor de gráficos', 'funcoes', 'Gráficos', 'ƒ', 'Até 3 funções de x no mesmo gráfico, com zeros.', ['gráfico', 'plotar', 'função', 'raízes']),
  t('funcao-afim', 'Função afim', 'funcoes', 'Funções', 'ax', 'Raiz, intercepto e comportamento de f(x)=ax+b.', ['linear', 'reta']),
  t('funcao-quadratica', 'Função quadrática', 'funcoes', 'Funções', 'x²', 'Vértice, raízes, discriminante e concavidade.', ['parábola', 'vértice']),
  t('circulo', 'Círculo e circunferência', 'geometria-plana', 'Figuras planas', '○', 'Diâmetro, comprimento e área.', ['raio', 'pi']),
  t('poligono-regular', 'Polígonos regulares', 'geometria-plana', 'Figuras planas', '⬠', 'Área, apótema, diagonais e ângulos.', ['lados', 'diagonais', 'ângulo interno']),
  t('cubo', 'Cubo', 'geometria-espacial', 'Sólidos', '▣', 'Volume, área total e diagonal.', ['aresta']),
  t('esfera', 'Esfera', 'geometria-espacial', 'Sólidos', '●', 'Volume e área da superfície.', ['raio']),
  t('cilindro', 'Cilindro', 'geometria-espacial', 'Sólidos', '▯', 'Volume, área lateral e total.', ['raio', 'altura']),
  t('cone', 'Cone', 'geometria-espacial', 'Sólidos', '△', 'Geratriz, volume e áreas.', ['raio', 'altura', 'geratriz']),
  t('graus-radianos', 'Graus e radianos', 'trigonometria', 'Razões', '°', 'Conversão entre graus e radianos.', ['ângulo']),
  t('razoes-trigonometricas', 'Seno, cosseno e tangente', 'trigonometria', 'Razões', 'sen', 'Razões de um ângulo, com tangente indefinida tratada.', ['seno', 'cosseno', 'tangente']),
  t('combinatoria', 'Permutação, arranjo e combinação', 'estatistica', 'Probabilidade', 'C', 'Análise combinatória exata.', ['fatorial', 'contagem']),
  t('segunda-lei-newton', 'Segunda lei de Newton', 'fisica', 'Dinâmica', 'F', 'F = m·a em unidades SI.', ['força', 'massa']),
  t('energia-cinetica', 'Energia cinética', 'fisica', 'Dinâmica', 'Ec', 'Ec = ½mv².', ['energia', 'velocidade']),
  t('lei-ohm', 'Lei de Ohm', 'fisica', 'Eletricidade', 'Ω', 'Tensão, corrente e resistência.', ['resistência', 'corrente']),
  t('derivada', 'Derivadas', 'calculo', 'Derivadas', 'f′', 'Derivada simbólica, regras usadas, tangente e ordem superior.', ['derivar', 'tangente', 'regra da cadeia', 'produto', 'quociente']),
  t('integral-indefinida', 'Integral indefinida', 'calculo', 'Integrais', '∫', 'Antiderivadas simbólicas de um subconjunto declarado.', ['primitiva', 'antiderivada']),
  t('integral-definida', 'Integral definida', 'calculo', 'Integrais', '∫ₐᵇ', 'Simpson e trapézio, com valor exato quando possível.', ['área', 'simpson', 'trapézio']),
  t('limite-numerico', 'Limite numérico', 'calculo', 'Limites', 'lim', 'Limites laterais por aproximação numérica.', ['limite', 'lateral', 'infinito']),
  t('raiz-newton', 'Raiz por Newton-Raphson', 'calculo', 'Raízes', 'x₀', 'Raiz aproximada de f(x)=0 com convergência verificada.', ['zero', 'newton', 'equação']),
  t('tabela-verdade', 'Tabela-verdade', 'discreta', 'Lógica', '∧', 'Tabela, tautologia, contradição ou contingência.', ['proposição', 'tautologia', 'lógica']),
  t('equivalencia-logica', 'Equivalência lógica', 'discreta', 'Lógica', '≡', 'Compara duas proposições (De Morgan, contrapositiva).', ['de morgan', 'equivalência', 'contrapositiva']),
  t('conjuntos', 'Operações com conjuntos', 'discreta', 'Conjuntos', '∪', 'União, interseção, diferença, partes e produto cartesiano.', ['união', 'interseção', 'subconjunto']),
  t('bases-numericas', 'Bases numéricas', 'discreta', 'Sistemas numéricos', '0b', 'Binário, octal, decimal e hexadecimal.', ['binário', 'hexadecimal', 'octal']),
  t('aritmetica-modular', 'Aritmética modular', 'discreta', 'Aritmética', 'mod', 'Soma, produto, potência e inverso modulares.', ['congruência', 'resto', 'inverso']),
  t('pa-pg', 'Progressões PA e PG', 'discreta', 'Sequências', 'aₙ', 'Termo geral e soma de PA e PG.', ['progressão', 'razão', 'termo geral']),
  t('fibonacci', 'Sequência de Fibonacci', 'discreta', 'Sequências', 'F', 'F(n) exato para n até 1000.', ['recorrência']),
  t('estatistica-descritiva', 'Estatística descritiva', 'estatistica', 'Descritiva', 'σ', 'Média, mediana, moda, variância, quartis, percentis e tabela de frequências.', ['média', 'mediana', 'desvio padrão', 'variância', 'quartil', 'percentil', 'moda', 'frequência', 'histograma']),
  t('porcentagem', 'Porcentagem', 'basica', 'Calculadoras', '%', 'Porcentagens, aumentos e descontos.', ['percentual', 'desconto']),
  t('regra-de-tres', 'Regra de três', 'basica', 'Proporção', '∝', 'Grandezas direta e inversamente proporcionais.', ['proporção', 'razão']),
  t('equacao-1grau', 'Equação do 1º grau', 'algebra', 'Equações', 'ax', 'Resolve ax + b = c com verificação.', ['linear', 'incógnita']),
  t('equacao-2grau', 'Equação do 2º grau', 'algebra', 'Equações', 'x²', 'Bhaskara, discriminante e raízes.', ['bhaskara', 'delta', 'quadrática']),
  t('pitagoras', 'Teorema de Pitágoras', 'geometria-plana', 'Triângulos', 'c²', 'Hipotenusa e catetos.', ['hipotenusa', 'cateto']),
  t('juros-simples', 'Juros simples', 'financeira', 'Juros', 'J', 'Capital, taxa, tempo, juros e montante.', ['juros', 'capital', 'montante']),
  t('juros-compostos', 'Juros compostos', 'financeira', 'Juros', 'M', 'Evolução do capital com gráfico.', ['juros', 'montante', 'capitalização']),
]

// Uma ferramenta só é 'available' se existir um módulo executável para ela.
export const tools: Tool[] = [...raw, ...allDefs.map(d => ({ ...d.meta, status: 'planned' as const }))].map(x => ({ ...x, status: (x.id in modules || customTools.includes(x.id)) ? 'available' : 'planned' }))

export const getTool = (id: string) => tools.find(x => x.id === id)
export const toolsByCategory = (cat: string) => tools.filter(x => x.category === cat)
export const toolPath = (x: Tool) => `/ferramenta/${x.id}`
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function searchTools(query: string): Tool[] {
  const terms = norm(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return tools.filter(x => {
    const cat = categories.find(c => c.id === x.category)
    const hay = norm([x.name, x.description, x.subcategory, cat?.name ?? '', ...x.keywords].join(' '))
    return terms.every(term => hay.includes(term))
  })
}
