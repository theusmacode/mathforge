# ROADMAP — fonte de verdade

Legenda: **P** Planejada · **D** Em desenvolvimento · **I** Implementada, não verificada · **V** Verificada · **B** Bloqueada por dependência externa.
"Verificada" exige `npm test` + `npm run build` + teste na interface. Isso ainda NÃO foi feito para nenhuma ferramenta (ambiente sem internet): a lógica pura foi testada em Node (33/33), mas nada foi compilado nem aberto no navegador. Por isso nenhuma ferramenta está como V.

## Ferramentas
Nenhuma está **V**: `npm install/test/build` não puderam rodar (sem internet). A lógica pura foi testada em Node com adaptador do vitest (253/253), mas isso não vale como verificação oficial.
| Ferramenta | Área | Status | Arquivos | Testes | Pendências |
|---|---|---|---|---|---|
| Calculadora básica / científica (visor editável, teclado, memória MC/MR/M±/MS, ANS, DEG/RAD, 2nd, hiperbólicas, %, histórico, copiar, enviar ao gráfico) | Básica | I | core/expression.ts, features/Calculator.tsx | expression.test.ts, calc-ext.test.ts (motor; teclado/UI não testados) | frações em formato empilhado, log em base arbitrária |
| Operações com frações | Básica | I | core/fraction.ts, modules.ts | basic.test.ts | frações mistas |
| Simplificar fração | Básica | I | idem | idem | — |
| MMC e MDC | Básica | I | core/number-theory.ts | basic.test.ts | mais de 2 números |
| Fatoração em primos | Básica | I | core/number-theory.ts | basic.test.ts | limite 10¹² |
| Regra de três (simples) | Básica | I | core/proportion.ts | basic.test.ts | regra composta (P) |
| Equação do 1º grau | Álgebra | I | core/algebra.ts | basic.test.ts | — |
| Equação do 2º grau | Álgebra | I | core/algebra.ts | math.test.ts | — |
| Pitágoras | Geometria plana | I | core/geometry.ts | math.test.ts | — |
| Juros simples / compostos | Financeira | I | core/finance.ts | math.test.ts | tabela, gráfico, incógnitas |
| Porcentagem | Básica | I | core/basic.ts | math.test.ts (só cálculo) | variações percentuais |
| Conversão de unidades | Utilitários | I | core/units.ts | units-commercial.test.ts | notação científica, alg. significativos |
| Variação percentual | Comercial | I | core/commercial.ts | idem | — |
| Desconto e acréscimo | Comercial | I | idem | idem | descontos sucessivos |
| Valor original | Comercial | I | idem | idem | — |
| Margem e markup | Comercial | I | idem | idem | — |
| Módulo de gráficos (até 6 funções, cor/ocultar, derivada tracejada, zoom/arrasto, janela x/y, rastreio, f(x) em um ponto, tabela de valores, análise: zeros, intercepto, pontos críticos, interseções) | Funções | I | core/plot.ts, features/Grapher.tsx | expansion.test.ts (lógica; interação/SVG não testados) | domínio/imagem, composição/inversa, tangente, exportar imagem |
| Função afim / quadrática | Funções | I | features/modules.ts | expansion.test.ts | gráfico embutido |
| Círculo; polígonos regulares | Geometria plana | I | core/science.ts | expansion.test.ts | quadrado/retângulo, trapézio, losango, setor, Tales, semelhança |
| Cubo, esfera, cilindro, cone | Geometria espacial | I | core/science.ts | expansion.test.ts | prismas, pirâmides, paralelepípedo, medidas desconhecidas, diagramas |
| Graus↔radianos; sen/cos/tan | Trigonometria | I | core/science.ts | expansion.test.ts | leis dos senos/cossenos, identidades, equações |
| Permutação/arranjo/combinação | Estatística e prob. | I | core/science.ts | expansion.test.ts | média/mediana/desvio, tabelas, binomial, normal |
| Segunda lei de Newton; Energia cinética; Lei de Ohm | Física | I | features/modules.ts | expansion.test.ts | MU/MUV, trabalho, potência, pressão, resistores |
| Derivada (simbólica, ordem 1–3, tangente) | Cálculo | I | core/calculus.ts, features/modules-advanced.ts | calc-discrete.test.ts (13 expressões verificadas por diferença central) | regra implícita, simplificação algébrica mais forte |
| Integral indefinida (subconjunto) | Cálculo | I | idem | idem | substituição, partes (recusa fora do subconjunto) |
| Integral definida (Simpson/trapézio) | Cálculo | I | idem | idem | área entre curvas, Riemann |
| Limite numérico (laterais) | Cálculo | I | idem | idem | limites no infinito, continuidade |
| Raiz por Newton-Raphson | Cálculo | I | idem | idem | bisseção, Taylor, séries, EDOs |
| Tabela-verdade; Equivalência lógica | Discreta | I | core/discrete.ts | calc-discrete.test.ts | validade de argumentos |
| Conjuntos | Discreta | I | idem | idem | diagramas de Venn, complemento (precisa universo) |
| Bases numéricas | Discreta | I | idem | idem | operações entre bases, complemento de dois |
| Aritmética modular | Discreta | I | idem | idem | congruências lineares, primalidade |
| PA e PG; Fibonacci | Discreta | I | idem | idem | recorrências gerais |
| Estatística descritiva (média, mediana, moda, variância pop./amostral, quartis, percentil, atípicos, frequências) | Estatística | I | core/stats.ts, modules-advanced.ts | stats.test.ts | binomial, normal, correlação, regressão, gráfico de dispersão |
| Triângulos, Área/perímetro | Geometria | P | — | — | registradas, sem módulo |
**Planejadas e ainda fora desta etapa:** razão e proporção, potências/raízes (existem só na calculadora), conversão de unidades, notação científica, arredondamento, regra de três composta, e todas as demais áreas do prompt original.

## Plataforma
- Favoritos e histórico persistentes (LocalStorage, tolerante a corrupção): I — core/persist.ts (testado), features/store.ts e páginas (não executados no navegador).
- Dashboard redesenhado (paleta roxo/verde/amarelo, estatísticas reais, sidebar recolhível): I — imagem de referência recebida e analisada (composição: sidebar, cartões de estatística, painel de barras roxo, rosca, cores); painéis de barras e rosca implementados com dados do registro. Não conferido visualmente.
- Liquid Glass: I (não conferido visualmente). Configurações de precisão, filtros, CSV, PDF: P.

## Bloqueios
Sem internet no ambiente de geração: sem `npm install` (Recharts, Math.js), sem build, sem navegador.

## Próxima tarefa
1. Rodar `npm install && npm test && npm run build`, corrigir erros e promover itens para V.
2. Razão/proporção, notação científica, arredondamento, regra de três composta, descontos sucessivos, memória da calculadora; depois álgebra avançada e funções/gráficos.

## Contagem do registro (calculada por script, não manual)
**127 disponíveis de 127 registradas** (0 planejadas). Por área: básica 13 · comercial 6 · álgebra 24 · funções 3 · geom. plana 13 · geom. espacial 5 · trigonometria 5 · financeira 13 · estatística/probabilidade 16 · cálculo 5 · discreta 7 · física 17. Verificado por teste: ids e nomes únicos; todas as disponíveis têm módulo ou componente; nenhuma lança exceção com campos vazios.
Observação honesta sobre a contagem: os 4 casos de triângulo (LLL, LAL, ALA, LLA) são ferramentas com conjuntos de entrada distintos; se preferir contá-los como uma só, o total cai para 124.

## v0.6.0 — uma especificação de interface por ferramenta
`src/features/ui/specs.ts` define, para cada uma das 127 ferramentas, o layout, o enunciado interativo, os editores, os sliders, a seleção de unidades e as visualizações. `ToolShell` é dirigido por essa especificação. Inventário completo (gerado, não escrito à mão): **INVENTARIO.md**.
- **Layouts:** enunciado interativo (`{campo}` embutido na frase), figura, análise (cálculo), lógica, operação matricial (A op B = R) e 3 interfaces próprias preservadas.
- **Editores:** chips (listas), tabela de pares X–Y, coeficientes por grau, paleta de conectivos, teclado de funções, grade de matriz. **Controles:** sliders (%, taxas, prazos, probabilidades) e seletor de unidades com conversão para o SI (física).
- **Visuais:** 69 ferramentas com gráfico/figura/comparação (funções, Venn, barras de frações, círculo trigonométrico, distribuições, SSA com abas de duas soluções, etc.); 36 só com o enunciado interativo (lista abaixo).
- **Números honestos:** 127 ferramentas = 124 em `ToolShell` + 3 interfaces próprias; 112 enunciados distintos; 49 composições distintas (layout+editores+sliders+unidades+visual). Ferramentas da mesma família compartilham componentes e, em alguns casos, o enunciado (ex.: Price/SAC/comparação; juros simples/compostos; polinômios).
- **Pendentes (só enunciado):** mmc-mdc, fatoracao, conversao-unidades, poligono-regular, combinatoria, segunda-lei-newton, energia-cinetica, lei-ohm, bases-numericas, aritmetica-modular, regra-de-tres, produtos-notaveis, logaritmo-mudanca-base, combinacao-repeticao, binomio-newton, valor-presente, valor-presente-serie, taxas-equivalentes, taxas-proporcionais, desconto-comercial-racional, taxa-implicita-parcelamento, inflacao-taxa-real, equacao-torricelli, velocidade-media, aceleracao-media, trabalho-mecanico, energia-potencial, potencia-mecanica, densidade, pressao, teorema-tales, triangulo-retangulo-resolver, divisores-multiplos, potencia-raiz, arredondamento, resto-divisao.
- **Verificação:** 253 testes de lógica/visuais/especificações (Node + adaptador do vitest); `tsc --strict` limpo em tudo que não é React; renderização no servidor das 124 ToolShell com entradas válidas: 0 falhas (`scripts/smoke-render.tsx`). **Não verificados:** build do Vite, Vitest oficial, aparência/layout/interação em navegador (clicar, digitar em chips, arrastar sliders, foco), Layout/Dashboard/Favoritos/Histórico com estas mudanças.
- **Corrigido:** os campos de `sistema-linear`/`regra-cramer` eram numéricos na UI por causa de “|” no rótulo (v0.5.0).

## v0.5.0 — interfaces especializadas (UX/UI)
Problema: todas as ferramentas usavam o mesmo formulário (largura máx. 460 px, à esquerda). Solução: `ToolShell` + 8 modelos escolhidos por finalidade (`features/kinds.ts`) em um workspace de duas colunas (entradas | resultados), com resultados ao vivo.
- **Modelos:** calc (17), finance (13), matrix (9), stats (16), algebra/lógica (24), geometry/trigonometria (23), physics (17), analysis/cálculo (5) = 124 ferramentas. Mais 3 interfaces próprias preservadas: calculadora básica, científica e módulo de gráficos.
- **Visuais reais** (`features/visuals.ts`, calculados das entradas pelos motores existentes; nenhuma fórmula alterada): 32 ferramentas com gráfico/figura (juros, Price, SAC, comparação, aportes, histograma, dispersão+regressão, 8 figuras planas, 5 sólidos, 4 de cinemática, 5 de cálculo) e 6 com comparação original × resultado (desconto/acréscimo, valor original, variação %, porcentagem, margem, preço de venda).
- **Matrizes:** grade de células editável com controle de linhas/colunas, coluna b destacada em sistemas e alternativa de entrada em texto.
- **Estatística/álgebra/cálculo:** campos monoespaçados com exemplo (“Usar exemplo”), contador de valores reconhecidos.
- **Bug corrigido:** os campos de `sistema-linear` e `regra-cramer` tinham “|” no rótulo e eram lidos como campos numéricos na UI (a lógica funcionava, a tela não); o Bayes exibia rótulo/unidade errados. Teste de regressão adicionado.
- **Verificação:** 227 testes de lógica/visuais (Node + adaptador do vitest); `tsc --strict` limpo em core/features(não-React)/registro; **renderização no servidor (react-dom/server) de todas as 124 `ToolShell`: 0 falhas**. NÃO verificados: build do Vite, Vitest oficial, estilos/layout em navegador, interação (clique, foco, arrastar), `Layout/Dashboard/Favoritos/Histórico` com as mudanças.

## v0.4.0 — 81 ferramentas novas (todas I: lógica testada em Node, UI não compilada)
Código em `src/features/defs/*.ts` (catálogo declarativo `def(...)`: metadados + módulo) e motores em `src/core/` (`matrix`, `poly`, `prob`, `finance2`, `triangle`). Testes: `src/tests/defs.test.ts`.
- **Matrizes e sistemas (9):** soma/subtração, produto, escalar, transposta, determinante, inversa, escalonamento/posto, sistema linear (SPD/SPI/SI), Cramer. Entrada em texto multilinha (`1 2; 3 4`), até 8×8, ponto flutuante.
- **Álgebra (13):** polinômios (soma/sub, produto, divisão, Horner, fatoração por raízes racionais), produtos notáveis, binômio de Newton, inequações 1º/2º grau, equação modular/exponencial/logarítmica, mudança de base.
- **Estatística/probabilidade (15):** correlação+regressão+covariância, CV, média ponderada, 3 médias, prob. simples/união/condicional, Bayes, binomial, normal, perm. c/ repetição, comb. c/ repetição, princípio da contagem, Pascal.
- **Finanças/comercial (12):** Price, SAC, comparação, VP, aportes (VF), VP de série, taxas equivalentes, proporcionais, desconto comercial×racional, variações sucessivas, preço de venda, taxa implícita do parcelamento, taxa real.
- **Física (14):** MU, MUV, Torricelli, v média, a média, queda livre, lançamento vertical, trabalho, Ep gravitacional, potência, Hooke, densidade, pressão, resistores.
- **Geometria/trigonometria (14):** retângulo/quadrado, triângulos LLL/LAL/ALA/LLA(SSA com 0–2 soluções), trapézio, losango, setor, Tales, relações métricas, paralelepípedo, triângulo retângulo, trig inversas, amplitude/período.
- **Básica (4):** divisores/múltiplos, potência/raiz, arredondamento decimal exato, resto/divisão euclidiana.
- Removidas do registro as 2 entradas “planejadas” (Calculadora de triângulos, Área e perímetro): substituídas pelas ferramentas acima.
- Design: página de categoria reescrita (agrupada por subcategoria, filtro “só disponíveis”, contador); `Field.multiline` (textarea).

## v0.3.0
Calculadora científica reconstruída (teclado, memória, ANS, 2nd, DEG/RAD) e módulo de gráficos reconstruído (workspace). **Meta de 100 ferramentas NÃO atingida: 46 disponíveis.** Verificação: `tsc --strict` limpo nos motores/módulos/registro (um erro real de exaustividade em `integ` foi corrigido); componentes React e build não verificados.

## v0.2.0 — redesign
Usuário relatou que a v0.1 compilou e funciona no ambiente dele. Nova direção visual (flat, sem gradientes, verde #00B981 sobre grafite #101113): CSS reescrito do zero (`styles/global.css`, tokens no `:root`), sidebar com seções Geral/Categorias, item ativo verde, versão, recolhimento com rótulos acessíveis (título nativo como tooltip), dashboard recomposto (cabeçalho, 4 indicadores reais, coluna principal + lista de categorias, tabela de estado). Gráficos de barras/rosca removidos: só mediam o registro, sem valor real para o usuário. A imagem de referência desta etapa **não foi recebida**. Visual não conferido em navegador.

## Etapa anterior
- Dashboard: tabela “Estado por área” (disponíveis, planejadas, total, barra de progresso, estado), além de barras e rosca. Resultados ganharam tabela (tabela-verdade), botão copiar e foco/animação refinados. **Não abertos em navegador.**
- Campos de texto nos formulários genéricos (`Field.text`) e `Result.table`.
- Motor de Cálculo: AST próprio (sem eval). Limites: derivada exata só para x, constantes, + − * / ^, sin, cos, tan, exp, ln, sqrt, abs; integral simbólica só no subconjunto listado; ângulos em radianos.

## Próximas tarefas
1. `npm install && npm test && npm run build` (nunca executados aqui); corrigir; promover a V. 2. Revisão visual em navegador de cada layout (`npm run dev`). 3. Gráficos para as ferramentas restantes (eletricidade, probabilidade/binomial/normal), exportar CSV, prismas/pirâmides.
2. Triângulos com SSA, retângulo/trapézio/losango, leis dos senos/cossenos.
3. Sistemas lineares, matrizes, polinômios; Price/SAC; MU/MUV; grafos (BFS/DFS/Dijkstra); Taylor e séries.
