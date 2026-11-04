# Inventário de interfaces — 127 ferramentas

Gerado por `scripts/smoke-render.tsx` a partir de `src/features/ui/specs.ts`.
Composições distintas (layout + editores + sliders + unidades + tipo de visual): **49**. Enunciados únicos: **112**.

**Verificação**: “render” = a interface renderizou no servidor sem erro (react-dom/server) com entradas de exemplo; o cálculo de cada ferramenta é coberto pela suíte de testes da lógica. Nenhuma foi inspecionada num navegador.

| Ferramenta | id | Área | Layout | Componentes | Interações | Visualização | Verificação |
|---|---|---|---|---|---|---|---|
| Calculadora básica | calculadora-basica | Matemática básica | Interface própria | Calculator | teclado numérico; memória; histórico | — | preservada (testes do motor; UI não exercitada aqui) |
| Calculadora científica | calculadora-cientifica | Matemática básica | Interface própria | Calculator | teclado científico; memória; DEG/RAD; 2nd | — | preservada (testes do motor; UI não exercitada aqui) |
| Operações com frações | fracoes | Matemática básica | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | barras de frações A, B e resultado | fractions | ✓ render com resultado |
| Simplificar fração | simplificar-fracao | Matemática básica | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | barras de frações equivalentes | fractions | ✓ render com resultado |
| MMC e MDC | mmc-mdc | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Fatoração em primos | fatoracao | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Conversão de unidades | conversao-unidades | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Variação percentual | variacao-percentual | Porcentagem e comercial | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | comparação inicial × final | comparação | ✓ render com resultado |
| Desconto e acréscimo | desconto-acrescimo | Porcentagem e comercial | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | slider %; comparação antes × depois | comparação | ✓ render com resultado |
| Valor original | valor-original | Porcentagem e comercial | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | slider %; comparação original × final | comparação | ✓ render com resultado |
| Margem e markup | margem-markup | Porcentagem e comercial | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | comparação custo × venda | comparação | ✓ render com resultado |
| Construtor de gráficos | grafico-funcoes | Funções e gráficos | Interface própria | Grapher | zoom/arrasto; rastreio; análise | — | preservada (testes do motor; UI não exercitada aqui) |
| Função afim | funcao-afim | Funções e gráficos | figure | EquationBar (enunciado interativo), ChartView/ShapeView | gráfico com raiz | line | ✓ render com resultado |
| Função quadrática | funcao-quadratica | Funções e gráficos | figure | EquationBar (enunciado interativo), ChartView/ShapeView | parábola, vértice, raízes e eixo | line | ✓ render com resultado |
| Círculo e circunferência | circulo | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | figura com r, d, A e C | figura:circle | ✓ render com resultado |
| Polígonos regulares | poligono-regular | Geometria plana | figure | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Cubo | cubo | Geometria espacial | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:cuboid | ✓ render com resultado |
| Esfera | esfera | Geometria espacial | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:sphere | ✓ render com resultado |
| Cilindro | cilindro | Geometria espacial | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:cylinder | ✓ render com resultado |
| Cone | cone | Geometria espacial | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:cone | ✓ render com resultado |
| Graus e radianos | graus-radianos | Trigonometria | figure | EquationBar (enunciado interativo), ChartView/ShapeView | círculo trigonométrico | figura:unitcircle | ✓ render com resultado |
| Seno, cosseno e tangente | razoes-trigonometricas | Trigonometria | figure | EquationBar (enunciado interativo), ChartView/ShapeView | círculo trigonométrico com sen e cos | figura:unitcircle | ✓ render com resultado |
| Permutação, arranjo e combinação | combinatoria | Estatística e probabilidade | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Segunda lei de Newton | segunda-lei-newton | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Energia cinética | energia-cinetica | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Lei de Ohm | lei-ohm | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Derivadas | derivada | Cálculo | analysis | EquationBar (enunciado interativo), ExprEditor (teclado de funções), ChartView/ShapeView | teclado de funções; f e f′ no gráfico; abrir no módulo de gráficos | line | ✓ render com resultado |
| Integral indefinida | integral-indefinida | Cálculo | analysis | EquationBar (enunciado interativo), ExprEditor (teclado de funções), ChartView/ShapeView | teclado de funções; f e primitiva no gráfico; abrir no módulo de gráficos | line | ✓ render com resultado |
| Integral definida | integral-definida | Cálculo | analysis | EquationBar (enunciado interativo), ExprEditor (teclado de funções), ChartView/ShapeView | teclado de funções; área sombreada; abrir no módulo de gráficos | line | ✓ render com resultado |
| Limite numérico | limite-numerico | Cálculo | analysis | EquationBar (enunciado interativo), ExprEditor (teclado de funções), ChartView/ShapeView | teclado de funções; gráfico perto do ponto; abrir no módulo de gráficos | line | ✓ render com resultado |
| Raiz por Newton-Raphson | raiz-newton | Cálculo | analysis | EquationBar (enunciado interativo), ExprEditor (teclado de funções), ChartView/ShapeView | teclado de funções; raiz marcada no gráfico; abrir no módulo de gráficos | line | ✓ render com resultado |
| Tabela-verdade | tabela-verdade | Matemática discreta e lógica | logic | EquationBar (enunciado interativo), OpsEditor (conectivos), ChartView/ShapeView | paleta de conectivos; tabela V/F colorida | tabela | ✓ render com resultado |
| Equivalência lógica | equivalencia-logica | Matemática discreta e lógica | logic | EquationBar (enunciado interativo), OpsEditor (conectivos) | paleta de conectivos; contraexemplo | — | ✓ render com resultado |
| Operações com conjuntos | conjuntos | Matemática discreta e lógica | sentence | EquationBar (enunciado interativo), ChipsEditor, ChartView/ShapeView | chips editáveis; diagrama de Venn | venn | ✓ render com resultado |
| Bases numéricas | bases-numericas | Matemática discreta e lógica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Aritmética modular | aritmetica-modular | Matemática discreta e lógica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Progressões PA e PG | pa-pg | Matemática discreta e lógica | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | gráfico dos termos | line | ✓ render com resultado |
| Sequência de Fibonacci | fibonacci | Matemática discreta e lógica | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | barras da sequência | bars | ✓ render com resultado |
| Estatística descritiva | estatistica-descritiva | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChipsEditor, ChartView/ShapeView | chips editáveis; histograma; quartis | bars + tabela | ✓ render com resultado |
| Porcentagem | porcentagem | Matemática básica | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | slider %; comparação valor × parte | comparação | ✓ render com resultado |
| Regra de três | regra-de-tres | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Equação do 1º grau | equacao-1grau | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | reta × valor c com interseção | line | ✓ render com resultado |
| Equação do 2º grau | equacao-2grau | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | parábola, vértice e raízes | line | ✓ render com resultado |
| Teorema de Pitágoras | pitagoras | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | triângulo retângulo proporcional | figura:triangle | ✓ render com resultado |
| Juros simples | juros-simples | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | sliders de taxa e prazo; gráfico do montante | line | ✓ render com resultado |
| Juros compostos | juros-compostos | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | sliders de taxa e prazo; gráfico do montante | line | ✓ render com resultado |
| Soma e subtração de matrizes | matriz-soma | Álgebra | matrixop | MatrixGrid × operação, ChartView/ShapeView | grades editáveis A e B; operação + / −; matriz resultante ao lado | tabela | ✓ render com resultado |
| Produto de matrizes | matriz-produto | Álgebra | matrixop | MatrixGrid × operação, ChartView/ShapeView | grades A e B; compatibilidade de dimensões | tabela | ✓ render com resultado |
| Matriz por escalar | matriz-escalar | Álgebra | matrixop | MatrixGrid × operação, ChartView/ShapeView | grade A e escalar | tabela | ✓ render com resultado |
| Matriz transposta | matriz-transposta | Álgebra | matrixop | MatrixGrid × operação, ChartView/ShapeView | grade A e Aᵀ ao lado | tabela | ✓ render com resultado |
| Determinante | matriz-determinante | Álgebra | matrixop | MatrixGrid × operação | grade A e determinante | — | ✓ render com resultado |
| Matriz inversa | matriz-inversa | Álgebra | matrixop | MatrixGrid × operação, ChartView/ShapeView | verificação A·A⁻¹ | tabela | ✓ render com resultado |
| Escalonamento e posto | matriz-escalonamento | Álgebra | matrixop | MatrixGrid × operação, ChartView/ShapeView | forma escalonada e posto | tabela | ✓ render com resultado |
| Sistema linear (classificação e solução) | sistema-linear | Álgebra | matrixop | MatrixGrid × operação | equações escritas a partir da grade; classificação SPD/SPI/SI | — | ✓ render com resultado |
| Regra de Cramer | regra-cramer | Álgebra | matrixop | MatrixGrid × operação | equações escritas a partir da grade; D e Dᵢ | — | ✓ render com resultado |
| Soma e subtração de polinômios | polinomio-soma-sub | Álgebra | sentence | EquationBar (enunciado interativo), CoeffEditor | editor de coeficientes por grau | — | ✓ render com resultado |
| Produto de polinômios | polinomio-produto | Álgebra | sentence | EquationBar (enunciado interativo), CoeffEditor | editor de coeficientes por grau | — | ✓ render com resultado |
| Divisão de polinômios | polinomio-divisao | Álgebra | sentence | EquationBar (enunciado interativo), CoeffEditor | editor de coeficientes por grau | — | ✓ render com resultado |
| Valor de um polinômio (Horner) | polinomio-avaliacao | Álgebra | sentence | EquationBar (enunciado interativo), CoeffEditor | editor de coeficientes por grau | — | ✓ render com resultado |
| Fatoração por raízes racionais | polinomio-fatoracao | Álgebra | sentence | EquationBar (enunciado interativo), CoeffEditor | editor de coeficientes por grau | — | ✓ render com resultado |
| Produtos notáveis | produtos-notaveis | Álgebra | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Inequação do 1º grau | inequacao-linear | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | reta × valor c | line | ✓ render com resultado |
| Inequação do 2º grau | inequacao-quadratica | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | parábola com raízes | line | ✓ render com resultado |
| Equação modular |ax + b| = c | equacao-modulo | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | gráfico em V e reta y = c | line | ✓ render com resultado |
| Equação exponencial aˣ = b | equacao-exponencial | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | curva exponencial e reta y = b | line | ✓ render com resultado |
| Equação logarítmica logₐ(x) = b | equacao-logaritmica | Álgebra | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | curva logarítmica e reta y = b | line | ✓ render com resultado |
| Logaritmo em qualquer base | logaritmo-mudanca-base | Álgebra | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Correlação e regressão linear | correlacao-regressao | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), PairsEditor, ChartView/ShapeView | tabela de pares editável; dispersão + reta | scatter | ✓ render com resultado |
| Coeficiente de variação | coeficiente-variacao | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChipsEditor | chips editáveis | — | ✓ render com resultado |
| Média ponderada | media-ponderada | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), PairsEditor | tabela valor × peso | — | ✓ render com resultado |
| Médias aritmética, geométrica e harmônica | media-aritmetica-geometrica-harmonica | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChipsEditor | chips editáveis | — | ✓ render com resultado |
| Probabilidade simples | probabilidade-simples | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | barras favoráveis × possíveis | fractions | ✓ render com resultado |
| Probabilidade da união | probabilidade-uniao | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), Sliders | sliders de probabilidade | — | ✓ render com resultado |
| Probabilidade condicional | probabilidade-condicional | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), Sliders | sliders de probabilidade | — | ✓ render com resultado |
| Teorema de Bayes | teorema-bayes | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), Sliders | sliders de probabilidade | — | ✓ render com resultado |
| Distribuição binomial | distribuicao-binomial | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | slider p; distribuição P(X=k) | bars | ✓ render com resultado |
| Distribuição normal | distribuicao-normal | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChartView/ShapeView | curva normal com área acumulada | line | ✓ render com resultado |
| Permutação com repetição | permutacao-repeticao | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChipsEditor | chips editáveis | — | ✓ render com resultado |
| Combinação com repetição | combinacao-repeticao | Estatística e probabilidade | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Princípio fundamental da contagem | principio-contagem | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChipsEditor | chips editáveis | — | ✓ render com resultado |
| Triângulo de Pascal | triangulo-pascal | Estatística e probabilidade | sentence | EquationBar (enunciado interativo), ChartView/ShapeView |  | tabela | ✓ render com resultado |
| Binômio de Newton | binomio-newton | Álgebra | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Financiamento — Sistema Price | tabela-price | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | sliders; gráfico do saldo; tabela de amortização | line + tabela | ✓ render com resultado |
| Financiamento — Sistema SAC | tabela-sac | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | sliders; gráfico do saldo; tabela de amortização | line + tabela | ✓ render com resultado |
| Comparação Price × SAC | comparacao-price-sac | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | sliders; prestações Price × SAC | line + tabela | ✓ render com resultado |
| Valor presente (VP) | valor-presente | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders |  | — | ✓ render com resultado |
| Investimento com aportes periódicos | valor-futuro-aportes | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | gráfico montante × investido | line | ✓ render com resultado |
| Valor presente de uma série de pagamentos | valor-presente-serie | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders |  | — | ✓ render com resultado |
| Taxas equivalentes (juros compostos) | taxas-equivalentes | Matemática financeira | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Taxas proporcionais (juros simples) | taxas-proporcionais | Matemática financeira | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Desconto comercial e racional (simples) | desconto-comercial-racional | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders |  | — | ✓ render com resultado |
| Aumentos e descontos sucessivos | variacoes-sucessivas | Porcentagem e comercial | sentence | EquationBar (enunciado interativo), ChipsEditor | chips editáveis | — | ✓ render com resultado |
| Preço de venda (markup ou margem) | preco-venda | Porcentagem e comercial | sentence | EquationBar (enunciado interativo), Sliders, ChartView/ShapeView | slider %; comparação custo × preço | comparação | ✓ render com resultado |
| Taxa implícita do parcelamento | taxa-implicita-parcelamento | Matemática financeira | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Taxa real e inflação | inflacao-taxa-real | Matemática financeira | sentence | EquationBar (enunciado interativo), Sliders |  | — | ✓ render com resultado |
| Movimento uniforme (MU) | movimento-uniforme | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI), ChartView/ShapeView | gráfico s × t | line | ✓ render com resultado |
| Movimento uniformemente variado (MUV) | movimento-muv | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI), ChartView/ShapeView | gráficos s(t) e v(t) | line | ✓ render com resultado |
| Equação de Torricelli | equacao-torricelli | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Velocidade média | velocidade-media | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Aceleração média | aceleracao-media | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Queda livre | queda-livre | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI), ChartView/ShapeView | gráfico h × t | line | ✓ render com resultado |
| Lançamento vertical | lancamento-vertical | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI), ChartView/ShapeView | gráfico h × t | line | ✓ render com resultado |
| Trabalho mecânico | trabalho-mecanico | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Energia potencial gravitacional | energia-potencial | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Potência mecânica | potencia-mecanica | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Lei de Hooke e energia elástica | lei-hooke | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI), ChartView/ShapeView | gráfico F × x | line | ✓ render com resultado |
| Densidade | densidade | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Pressão | pressao | Física aplicada | sentence | EquationBar (enunciado interativo), UnitSelect (SI) |  | — | ✓ render com resultado |
| Resistores em série ou paralelo | resistores | Física aplicada | sentence | EquationBar (enunciado interativo), ChipsEditor, UnitSelect (SI) | chips editáveis | — | ✓ render com resultado |
| Retângulo e quadrado | retangulo | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | figura com diagonal e área | figura:rect | ✓ render com resultado |
| Triângulo — três lados (LLL) | triangulo-sss | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | figura proporcional com ângulos | figura:triangle | ✓ render com resultado |
| Triângulo — dois lados e o ângulo entre eles (LAL) | triangulo-sas | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | figura proporcional com ângulos | figura:triangle | ✓ render com resultado |
| Triângulo — dois ângulos e um lado (ALA) | triangulo-asa | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | figura proporcional com ângulos | figura:triangle | ✓ render com resultado |
| Triângulo — caso ambíguo (LLA / SSA) | triangulo-ssa | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView | abas Solução 1 / Solução 2; figura proporcional | figura:triangle + duas soluções | ✓ render com resultado |
| Trapézio | trapezio | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:trapezoid | ✓ render com resultado |
| Losango | losango | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:rhombus | ✓ render com resultado |
| Setor circular | setor-circular | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:sector | ✓ render com resultado |
| Teorema de Tales | teorema-tales | Geometria plana | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Relações métricas no triângulo retângulo | relacoes-metricas-retangulo | Geometria plana | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:triangle | ✓ render com resultado |
| Paralelepípedo retângulo | paralelepipedo | Geometria espacial | figure | EquationBar (enunciado interativo), ChartView/ShapeView |  | figura:cuboid | ✓ render com resultado |
| Resolver triângulo retângulo | triangulo-retangulo-resolver | Trigonometria | figure | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Funções trigonométricas inversas | trig-inversas | Trigonometria | figure | EquationBar (enunciado interativo), ChartView/ShapeView | círculo trigonométrico | figura:unitcircle | ✓ render com resultado |
| Amplitude, período e fase de y = A·sen(Bx + C) + D | amplitude-periodo | Trigonometria | figure | EquationBar (enunciado interativo), ChartView/ShapeView | senoide com linha média | line | ✓ render com resultado |
| Divisores e múltiplos | divisores-multiplos | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Potência e raiz enésima | potencia-raiz | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Arredondamento decimal | arredondamento | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
| Divisão inteira e resto | resto-divisao | Matemática básica | sentence | EquationBar (enunciado interativo) |  | — | ✓ render com resultado |
