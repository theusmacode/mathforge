/** Plano de interface POR FERRAMENTA. Cada entrada define a composição, os editores, os controles e as visualizações daquela operação.
 *  Validado por teste (src/tests/specs.test.ts) contra os campos reais de cada ferramenta. */
export type Layout = 'sentence' | 'matrixop' | 'figure' | 'logic' | 'analysis' | 'custom'
export type Editor = 'chips' | 'chips,' | 'coeffs' | 'ops' | 'expr' | `pairs:${string}`
export interface UiSpec {
  layout: Layout
  /** Enunciado interativo: {campo} vira um controle embutido na frase. */
  sentence?: string
  editors?: Record<string, Editor>
  /** Controles deslizantes: [mín, máx, passo], sincronizados com o campo. */
  sliders?: Record<string, [number, number, number]>
  /** Seletor de unidade por campo (converte para o SI antes de calcular). */
  units?: boolean
  /** Símbolo da operação (layout matrixop). */
  op?: string
  /** Interações extras, para o inventário. */
  extras?: string[]
}
const S = (sentence: string, o: Partial<UiSpec> = {}): UiSpec => ({ layout: 'sentence', sentence, ...o })
const F = (sentence: string, o: Partial<UiSpec> = {}): UiSpec => ({ layout: 'figure', sentence, ...o })
const P = (sentence: string, o: Partial<UiSpec> = {}): UiSpec => S(sentence, { units: true, ...o })
const M = (op: string, o: Partial<UiSpec> = {}): UiSpec => ({ layout: 'matrixop', op, ...o })
const pct: [number, number, number] = [0, 100, 1], rate: [number, number, number] = [0, 30, 0.1], prob: [number, number, number] = [0, 1, 0.01]

export const SPECS: Record<string, UiSpec> = {
  'calculadora-basica': { layout: 'custom', extras: ['teclado numérico', 'memória', 'histórico'] }, 'calculadora-cientifica': { layout: 'custom', extras: ['teclado científico', 'memória', 'DEG/RAD', '2nd'] },
  'grafico-funcoes': { layout: 'custom', extras: ['zoom/arrasto', 'rastreio', 'análise'] },
  fracoes: S('{n1}/{d1}  {op}  {n2}/{d2}', { extras: ['barras de frações A, B e resultado'] }), 'simplificar-fracao': S('Simplificar {n}/{d}', { extras: ['barras de frações equivalentes'] }),
  'mmc-mdc': S('MMC e MDC de {a} e {b}'), fatoracao: S('Fatorar {n} em primos'), 'conversao-unidades': S('Converter {v} de {de} para {para}'),
  porcentagem: S('{p} de {v}', { sliders: { p: pct }, extras: ['slider %', 'comparação valor × parte'] }), 'regra-de-tres': S('{a} está para {b} assim como {c} está para x   ({inv})'),
  'divisores-multiplos': S('Divisores e múltiplos de {n}'), 'potencia-raiz': S('Base {a} e expoente/índice {k}'), arredondamento: S('Arredondar {x} para {p} casas decimais — {m}'), 'resto-divisao': S('{a} ÷ {d}'),
  'variacao-percentual': S('De {a} para {b}', { extras: ['comparação inicial × final'] }),
  'desconto-acrescimo': S('Um produto de {v} recebe {m} de {p}', { sliders: { p: pct }, extras: ['slider %', 'comparação antes × depois'] }),
  'valor-original': S('Com {m} de {p}, o preço final é {f}', { sliders: { p: pct }, extras: ['slider %', 'comparação original × final'] }),
  'margem-markup': S('Custo {c}  ·  preço de venda {p}', { extras: ['comparação custo × venda'] }), 'variacoes-sucessivas': S('Variações em sequência (%): {p}', { editors: { p: 'chips' }, extras: ['chips editáveis'] }),
  'preco-venda': S('Custo {c} com {k} de {m}', { sliders: { m: [0, 200, 1] }, extras: ['slider %', 'comparação custo × preço'] }),
  'funcao-afim': F('f(x) = {a}·x + {b}', { extras: ['gráfico com raiz'] }), 'funcao-quadratica': F('f(x) = {a}·x² + {b}·x + {c}', { extras: ['parábola, vértice, raízes e eixo'] }),
  circulo: F('Círculo de raio {r}', { extras: ['figura com r, d, A e C'] }), 'poligono-regular': F('Polígono regular de {n} lados, cada um com {l}'), pitagoras: F('a = {a}, b = {b}, c = {c}  (deixe um em branco)', { extras: ['triângulo retângulo proporcional'] }),
  retangulo: F('Retângulo {b} × {h}', { extras: ['figura com diagonal e área'] }),
  'triangulo-sss': F('Lados {a}, {b} e {c}', { extras: ['figura proporcional com ângulos'] }), 'triangulo-sas': F('Lados {a} e {b}, com ângulo {c} entre eles', { extras: ['figura proporcional com ângulos'] }),
  'triangulo-asa': F('Ângulos {a} e {b}, lado {c}', { extras: ['figura proporcional com ângulos'] }), 'triangulo-ssa': F('Lado a = {a}, lado b = {b}, ângulo A = {c}', { extras: ['abas Solução 1 / Solução 2', 'figura proporcional'] }),
  trapezio: F('Bases {b1} e {b2}, altura {h}'), losango: F('Diagonais {d1} e {d2}'), 'setor-circular': F('Raio {r}, ângulo central {a} ({u})'), 'teorema-tales': S('{a} / {b} = {c} / x'),
  'relacoes-metricas-retangulo': F('Triângulo retângulo com catetos {b} e {c}'),
  cubo: F('Cubo de aresta {a}'), esfera: F('Esfera de raio {r}'), cilindro: F('Cilindro de raio {r} e altura {h}'), cone: F('Cone de raio {r} e altura {h}'), paralelepipedo: F('Paralelepípedo {a} × {b} × {c}'),
  'graus-radianos': F('{v} — converter {d}', { extras: ['círculo trigonométrico'] }), 'razoes-trigonometricas': F('Ângulo {a} em {u}', { extras: ['círculo trigonométrico com sen e cos'] }),
  'triangulo-retangulo-resolver': F('a = {a}, b = {b}, c = {c}, A = {A}  (informe dois)'), 'trig-inversas': F('Valor {v}', { extras: ['círculo trigonométrico'] }),
  'amplitude-periodo': F('y = {A}·sen({B}·x + {C}) + {D}', { extras: ['senoide com linha média'] }),
  combinatoria: S('{n} elementos, escolhendo {k}'), 'estatistica-descritiva': { layout: 'sentence', sentence: 'Dados: {dados}   Percentil: {p}', editors: { dados: 'chips' }, extras: ['chips editáveis', 'histograma', 'quartis'] },
  'correlacao-regressao': { layout: 'sentence', sentence: 'Pares (X, Y): {x}   Previsão em x = {p}', editors: { x: 'pairs:y' }, extras: ['tabela de pares editável', 'dispersão + reta'] },
  'coeficiente-variacao': S('Dados: {d}   Desvio: {k}', { editors: { d: 'chips' }, extras: ['chips editáveis'] }), 'media-ponderada': S('Valores e pesos: {v}', { editors: { v: 'pairs:w' }, extras: ['tabela valor × peso'] }),
  'media-aritmetica-geometrica-harmonica': S('Valores positivos: {d}', { editors: { d: 'chips' }, extras: ['chips editáveis'] }), 'probabilidade-simples': S('{f} casos favoráveis em {t} possíveis', { extras: ['barras favoráveis × possíveis'] }),
  'probabilidade-uniao': S('P(A) = {a}   P(B) = {b}   P(A∩B) = {i}', { sliders: { a: prob, b: prob, i: prob }, extras: ['sliders de probabilidade'] }),
  'probabilidade-condicional': S('P(A∩B) = {i}   P(B) = {b}   P(A) = {a}', { sliders: { i: prob, b: prob }, extras: ['sliders de probabilidade'] }),
  'teorema-bayes': S('P(A) = {a}   P(B∣A) = {s}   P(B∣¬A) = {f}', { sliders: { a: [0, 1, 0.001], s: prob, f: prob }, extras: ['sliders de probabilidade'] }),
  'distribuicao-binomial': S('{n} ensaios, p = {p}, k = {k}', { sliders: { p: prob }, extras: ['slider p', 'distribuição P(X=k)'] }), 'distribuicao-normal': S('μ = {m}   σ = {s}   x = {x}', { extras: ['curva normal com área acumulada'] }),
  'permutacao-repeticao': S('Repetições de cada elemento: {r}', { editors: { r: 'chips' }, extras: ['chips editáveis'] }), 'combinacao-repeticao': S('{n} tipos, escolhendo {k} com reposição'),
  'principio-contagem': S('Opções em cada etapa: {e}', { editors: { e: 'chips' }, extras: ['chips editáveis'] }), 'triangulo-pascal': S('Gerar {n} linhas'),
  'segunda-lei-newton': P('F = {m} · {a}'), 'energia-cinetica': P('Ec = ½ · {m} · {v}²'), 'lei-ohm': P('V = {V}   I = {I}   R = {R}   (deixe um em branco)'),
  'movimento-uniforme': P('s = {s0} + {v} · {t}', { extras: ['gráfico s × t'] }), 'movimento-muv': P('s₀ = {s0}   v₀ = {v0}   a = {a}   t = {t}', { extras: ['gráficos s(t) e v(t)'] }),
  'equacao-torricelli': P('v² = {v0}² + 2 · {a} · {d}'), 'velocidade-media': P('vm = {d} ÷ {t}'), 'aceleracao-media': P('a = ({v} − {v0}) ÷ {t}'),
  'queda-livre': P('Queda de {h}   (g = {g})', { extras: ['gráfico h × t'] }), 'lancamento-vertical': P('Lançado a {v0}, de altura {h0}   (g = {g})', { extras: ['gráfico h × t'] }),
  'trabalho-mecanico': P('W = {f} · {d} · cos({a})'), 'energia-potencial': P('Ep = {m} · {g} · {h}'), 'potencia-mecanica': P('P = {w} ÷ {t}'), 'lei-hooke': P('F = {k} · {x}', { extras: ['gráfico F × x'] }),
  densidade: P('ρ = {m} ÷ {v}'), pressao: P('p = {f} ÷ {a}'), resistores: P('Resistências ({k}): {r}', { editors: { r: 'chips' }, extras: ['chips editáveis'] }),
  derivada: { layout: 'analysis', sentence: 'f(x) = {f}   em x₀ = {x0}   ordem {ord}', editors: { f: 'expr' }, extras: ['teclado de funções', 'f e f′ no gráfico', 'abrir no módulo de gráficos'] },
  'integral-indefinida': { layout: 'analysis', sentence: '∫ {f} dx', editors: { f: 'expr' }, extras: ['teclado de funções', 'f e primitiva no gráfico', 'abrir no módulo de gráficos'] },
  'integral-definida': { layout: 'analysis', sentence: '∫ de {a} até {b} de {f} dx   ({m})', editors: { f: 'expr' }, extras: ['teclado de funções', 'área sombreada', 'abrir no módulo de gráficos'] },
  'limite-numerico': { layout: 'analysis', sentence: 'lim x → {a} de {f}', editors: { f: 'expr' }, extras: ['teclado de funções', 'gráfico perto do ponto', 'abrir no módulo de gráficos'] },
  'raiz-newton': { layout: 'analysis', sentence: 'f(x) = {f}   chute inicial {x0}', editors: { f: 'expr' }, extras: ['teclado de funções', 'raiz marcada no gráfico', 'abrir no módulo de gráficos'] },
  'tabela-verdade': { layout: 'logic', sentence: 'Proposição: {e}', editors: { e: 'ops' }, extras: ['paleta de conectivos', 'tabela V/F colorida'] },
  'equivalencia-logica': { layout: 'logic', sentence: 'A: {a}   B: {b}', editors: { a: 'ops', b: 'ops' }, extras: ['paleta de conectivos', 'contraexemplo'] },
  conjuntos: { layout: 'sentence', sentence: 'A: {A}   B: {B}', editors: { A: 'chips,', B: 'chips,' }, extras: ['chips editáveis', 'diagrama de Venn'] },
  'bases-numericas': S('{v} na {b}'), 'aritmetica-modular': S('a = {a}   b = {b}   módulo {m}'), 'pa-pg': S('{k}: a₁ = {a1}, razão {r}, {n} termos', { extras: ['gráfico dos termos'] }), fibonacci: S('F({n})', { extras: ['barras da sequência'] }),
  'equacao-1grau': S('{a}·x + {b} = {c}', { extras: ['reta × valor c com interseção'] }), 'equacao-2grau': S('{a}·x² + {b}·x + {c} = 0', { extras: ['parábola, vértice e raízes'] }),
  'polinomio-soma-sub': { layout: 'sentence', sentence: 'P = {p}   {op}   Q = {q}', editors: { p: 'coeffs', q: 'coeffs' }, extras: ['editor de coeficientes por grau'] },
  'polinomio-produto': { layout: 'sentence', sentence: 'P = {p}   ×   Q = {q}', editors: { p: 'coeffs', q: 'coeffs' }, extras: ['editor de coeficientes por grau'] },
  'polinomio-divisao': { layout: 'sentence', sentence: 'P = {p}   ÷   Q = {q}', editors: { p: 'coeffs', q: 'coeffs' }, extras: ['editor de coeficientes por grau'] },
  'polinomio-avaliacao': { layout: 'sentence', sentence: 'P = {p}   em x = {x}', editors: { p: 'coeffs' }, extras: ['editor de coeficientes por grau'] },
  'polinomio-fatoracao': { layout: 'sentence', sentence: 'Fatorar P = {p}', editors: { p: 'coeffs' }, extras: ['editor de coeficientes por grau'] },
  'produtos-notaveis': S('(a ± b) com a = {a} e b = {b}'), 'inequacao-linear': S('{a}·x + {b}  {op}  {c}', { extras: ['reta × valor c'] }), 'inequacao-quadratica': S('{a}·x² + {b}·x + {c}  {op}', { extras: ['parábola com raízes'] }), 'equacao-modulo': S('|{a}·x + {b}| = {c}', { extras: ['gráfico em V e reta y = c'] }),
  'equacao-exponencial': S('{a}^x = {b}', { extras: ['curva exponencial e reta y = b'] }), 'equacao-logaritmica': S('log de x na base {a} é {b}', { extras: ['curva logarítmica e reta y = b'] }), 'logaritmo-mudanca-base': S('log de {b} na base {a}'), 'binomio-newton': S('({a}·x + {b})^{e}'),
  'matriz-soma': M('±', { extras: ['grades editáveis A e B', 'operação + / −', 'matriz resultante ao lado'] }), 'matriz-produto': M('×', { extras: ['grades A e B', 'compatibilidade de dimensões'] }),
  'matriz-escalar': M('k·', { extras: ['grade A e escalar'] }), 'matriz-transposta': M('ᵀ', { extras: ['grade A e Aᵀ ao lado'] }), 'matriz-determinante': M('det', { extras: ['grade A e determinante'] }),
  'matriz-inversa': M('⁻¹', { extras: ['verificação A·A⁻¹'] }), 'matriz-escalonamento': M('rref', { extras: ['forma escalonada e posto'] }),
  'sistema-linear': M('sist', { extras: ['equações escritas a partir da grade', 'classificação SPD/SPI/SI'] }), 'regra-cramer': M('cramer', { extras: ['equações escritas a partir da grade', 'D e Dᵢ'] }),
  'juros-simples': S('{c} a {i} por período, durante {t}', { sliders: { i: rate, t: [1, 120, 1] }, extras: ['sliders de taxa e prazo', 'gráfico do montante'] }),
  'juros-compostos': S('{c} a {i} por período, durante {t}', { sliders: { i: rate, t: [1, 120, 1] }, extras: ['sliders de taxa e prazo', 'gráfico do montante'] }),
  'tabela-price': S('Financiar {v} a {i} ao mês em {n} parcelas', { sliders: { i: [0, 10, 0.05], n: [1, 360, 1] }, extras: ['sliders', 'gráfico do saldo', 'tabela de amortização'] }),
  'tabela-sac': S('Financiar {v} a {i} ao mês em {n} parcelas', { sliders: { i: [0, 10, 0.05], n: [1, 360, 1] }, extras: ['sliders', 'gráfico do saldo', 'tabela de amortização'] }),
  'comparacao-price-sac': S('Financiar {v} a {i} ao mês em {n} parcelas', { sliders: { i: [0, 10, 0.05], n: [1, 360, 1] }, extras: ['sliders', 'prestações Price × SAC'] }),
  'valor-presente': S('Valor futuro {vf}, {i} por período, {n} períodos', { sliders: { i: rate } }), 'valor-futuro-aportes': S('{c} inicial + {p} por período a {i}, durante {n} períodos, aportes {t}', { sliders: { i: rate, n: [1, 360, 1] }, extras: ['gráfico montante × investido'] }),
  'valor-presente-serie': S('Série de {p} a {i} durante {n} períodos', { sliders: { i: rate } }), 'taxas-equivalentes': S('{i} ao {a} equivale a quanto ao {b}?'), 'taxas-proporcionais': S('{i} ao {a} corresponde a quanto ao {b}?'),
  'desconto-comercial-racional': S('Título de {n} com {i} por período, {t} períodos antes do vencimento', { sliders: { i: rate } }), 'taxa-implicita-parcelamento': S('À vista {v}, ou {n}x de {p}'),
  'inflacao-taxa-real': S('Taxa nominal {r}  ·  inflação {i}', { sliders: { r: [0, 40, 0.1], i: [0, 40, 0.1] } }),
}
