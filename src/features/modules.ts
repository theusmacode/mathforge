import type { ToolModule, Result } from '../core/types.ts'
import { fmt } from '../core/format.ts'
import { simpleInterest, compoundInterest } from '../core/finance.ts'
import { solveQuadratic } from '../core/algebra.ts'
import { pythagoras } from '../core/geometry.ts'
import { percentOf } from '../core/basic.ts'
import { gcd, lcm, factorize } from '../core/number-theory.ts'
import * as F from '../core/fraction.ts'
import { ruleOfThree } from '../core/proportion.ts'
import { solveLinear } from '../core/algebra.ts'
import { UNITS, convert } from '../core/units.ts'
import { pctChange, applyPct, originalValue, marginMarkup } from '../core/commercial.ts'
const unitOpts = UNITS.map((x, i) => ({ value: i, label: `${x.dim}: ${x.label}` }))
const modeOpts = [{ value: 0, label: 'Desconto' }, { value: 1, label: 'Acréscimo' }]
const calcOut = (r: { ok: true; value: number } | { ok: false; error: string }, label: string, formula: string, step: string, suffix = ''): Result =>
  r.ok ? { ok: true, formulas: [formula], steps: [step.replace('{r}', fmt(r.value))], outputs: [{ label, value: fmt(r.value, 6) + suffix }] } : { ok: false, error: r.error }
import { advanced } from './modules-advanced.ts'
import { allDefs } from './defs/index.ts'
import { visualFor } from './visuals.ts'
import * as S from '../core/science.ts'
const num = (x: number, d = 6) => fmt(x, d)
const needPos = (...v: (number | undefined)[]) => (S.pos(...v) ? null : err('Os valores devem ser números positivos.'))
const out = (formulas: string[], steps: string[], outputs: [string, string][], notes?: string[]): Result =>
  ({ ok: true, formulas, steps, outputs: outputs.map(([label, value]) => ({ label, value })), notes })
const isInt = (...v: (number | undefined)[]) => v.every(x => Number.isInteger(x))

const err = (error: string): Result => ({ ok: false, error })

const finFields = [
  { id: 'c', label: 'Capital inicial', unit: 'R$' },
  { id: 'i', label: 'Taxa por período', unit: '%' },
  { id: 't', label: 'Tempo (mesmo período da taxa)', unit: 'períodos' },
]
const finCheck = (c = NaN, i = NaN, t = NaN) =>
  c < 0 ? 'O capital não pode ser negativo.' : i < 0 ? 'A taxa não pode ser negativa.' : t < 0 ? 'O tempo não pode ser negativo.' : null

const base: Record<string, ToolModule> = {
  'juros-simples': {
    fields: finFields,
    compute: ({ c, i, t }) => {
      const e = finCheck(c, i, t); if (e) return err(e)
      const r = simpleInterest(c!, i!, t!)
      return { ok: true, formulas: ['J = C · i · t', 'M = C + J'],
        steps: [`J = ${fmt(c!)} · ${fmt(i!)}% · ${fmt(t!)} = ${fmt(r.juros)}`, `M = ${fmt(c!)} + ${fmt(r.juros)} = ${fmt(r.montante)}`],
        outputs: [{ label: 'Juros', value: fmt(r.juros, 2) }, { label: 'Montante', value: fmt(r.montante, 2) }],
        notes: ['Simulação matemática; não é oferta de crédito nem promessa de rendimento.'] }
    },
  },
  'juros-compostos': {
    fields: finFields,
    compute: ({ c, i, t }) => {
      const e = finCheck(c, i, t); if (e) return err(e)
      const r = compoundInterest(c!, i!, t!)
      return { ok: true, formulas: ['M = C · (1 + i)^t', 'J = M − C'],
        steps: [`M = ${fmt(c!)} · (1 + ${fmt(i! / 100)})^${fmt(t!)} = ${fmt(r.montante)}`, `J = ${fmt(r.montante)} − ${fmt(c!)} = ${fmt(r.juros)}`],
        outputs: [{ label: 'Montante', value: fmt(r.montante, 2) }, { label: 'Juros acumulados', value: fmt(r.juros, 2) }],
        notes: ['Simulação matemática; não é oferta de crédito nem promessa de rendimento.'] }
    },
  },
  'equacao-2grau': {
    fields: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c' }],
    compute: ({ a, b, c }) => {
      const s = solveQuadratic(a!, b!, c!)
      const base = { ok: true as const, formulas: ['Δ = b² − 4ac', 'x = (−b ± √Δ) / 2a'] }
      const eq = `${fmt(a!)}x² + ${fmt(b!)}x + ${fmt(c!)} = 0`
      switch (s.kind) {
        case 'all-reals': return { ...base, steps: ['a = 0 e b = 0 e c = 0: a igualdade vale para qualquer x.'], outputs: [{ label: 'Solução', value: 'Todos os reais' }] }
        case 'no-solution': return { ...base, steps: ['a = 0 e b = 0, mas c ≠ 0: a igualdade é impossível.'], outputs: [{ label: 'Solução', value: 'Sem solução' }] }
        case 'linear': return { ...base, steps: [`a = 0: a equação é do 1º grau, ${fmt(b!)}x + ${fmt(c!)} = 0`, `x = −c / b = ${fmt(s.x)}`], outputs: [{ label: 'x', value: fmt(s.x) }] }
        case 'two-real': return { ...base, steps: [eq, `Δ = ${fmt(b!)}² − 4·${fmt(a!)}·${fmt(c!)} = ${fmt(s.delta)} (> 0: duas raízes reais distintas)`],
          outputs: [{ label: 'x₁', value: fmt(s.x1) }, { label: 'x₂', value: fmt(s.x2) }, { label: 'Δ', value: fmt(s.delta) }],
          notes: [`Verificação: a·x₁²+b·x₁+c ≈ ${fmt(a! * s.x1 ** 2 + b! * s.x1 + c!, 6)}; em x₂ ≈ ${fmt(a! * s.x2 ** 2 + b! * s.x2 + c!, 6)} (zero, a menos de erro de ponto flutuante).`] }
        case 'one-real': return { ...base, steps: [eq, 'Δ = 0: uma raiz real repetida.'], outputs: [{ label: 'x', value: fmt(s.x) }, { label: 'Δ', value: '0' }] }
        case 'complex': return { ...base, steps: [eq, `Δ = ${fmt(s.delta)} (< 0): sem raízes reais; há duas raízes complexas conjugadas.`],
          outputs: [{ label: 'x₁', value: `${fmt(s.re)} + ${fmt(s.im)}i` }, { label: 'x₂', value: `${fmt(s.re)} − ${fmt(s.im)}i` }, { label: 'Δ', value: fmt(s.delta) }] }
      }
    },
  },
  pitagoras: {
    fields: [{ id: 'a', label: 'Cateto a', optional: true }, { id: 'b', label: 'Cateto b', optional: true }, { id: 'c', label: 'Hipotenusa c', optional: true }],
    compute: ({ a, b, c }) => {
      const r = pythagoras(a, b, c); if (!r.ok) return err(r.error)
      const f = { a: 'Cateto a', b: 'Cateto b', c: 'Hipotenusa c' }[r.found]
      const step = r.found === 'c' ? `c = √(${fmt(r.a)}² + ${fmt(r.b)}²) = ${fmt(r.c)}` : `${r.found} = √(c² − outro²) = ${fmt(r[r.found])}`
      return { ok: true, formulas: ['a² + b² = c²'], steps: [step], outputs: [{ label: f, value: fmt(r[r.found]) }],
        notes: [`Verificação: ${fmt(r.a ** 2 + r.b ** 2)} ≈ ${fmt(r.c ** 2)}`, 'Valor decimal aproximado quando a raiz não é exata.'] }
    },
  },

  fracoes: {
    fields: [{ id: 'n1', label: 'Numerador 1' }, { id: 'd1', label: 'Denominador 1' },
      { id: 'op', label: 'Operação', options: [{ value: 1, label: 'Somar (+)' }, { value: 2, label: 'Subtrair (−)' }, { value: 3, label: 'Multiplicar (×)' }, { value: 4, label: 'Dividir (÷)' }] },
      { id: 'n2', label: 'Numerador 2' }, { id: 'd2', label: 'Denominador 2' }],
    compute: ({ n1, d1, n2, d2, op }) => {
      try {
        const a = F.frac(n1!, d1!), b = F.frac(n2!, d2!)
        const r = [F.add, F.sub, F.mul, F.div][op! - 1](a, b); const sym = ['+', '−', '×', '÷'][op! - 1]
        return { ok: true, formulas: ['a/b + c/d = (ad + cb)/bd', 'a/b × c/d = ac/bd', 'a/b ÷ c/d = ad/bc'],
          steps: [`${F.toText(a)} ${sym} ${F.toText(b)}`, `Resultado simplificado pelo MDC: ${F.toText(r)}`],
          outputs: [{ label: 'Fração', value: F.toText(r) }, { label: 'Decimal (aproximado)', value: fmt(r.n / r.d, 10) }],
          notes: ['Cálculo exato com inteiros. Limite: valores intermediários até 2^53 − 1.'] }
      } catch (e) { return err((e as Error).message) }
    },
  },
  'simplificar-fracao': {
    fields: [{ id: 'n', label: 'Numerador' }, { id: 'd', label: 'Denominador' }],
    compute: ({ n, d }) => {
      try {
        const f = F.frac(n!, d!), g = gcd(n!, d!)
        return { ok: true, formulas: ['MDC(n, d) divide numerador e denominador'], steps: [`MDC(${fmt(n!)}, ${fmt(d!)}) = ${fmt(g)}`, `${fmt(n!)}/${fmt(d!)} = ${F.toText(f)}`],
          outputs: [{ label: 'Fração irredutível', value: F.toText(f) }], notes: ['O sinal fica no numerador; o denominador é sempre positivo.'] }
      } catch (e) { return err((e as Error).message) }
    },
  },
  'mmc-mdc': {
    fields: [{ id: 'a', label: 'Número a' }, { id: 'b', label: 'Número b' }],
    compute: ({ a, b }) => {
      if (!isInt(a, b)) return err('Informe números inteiros.')
      const m = lcm(a!, b!)
      if (!Number.isSafeInteger(m)) return err('Resultado grande demais para cálculo exato.')
      return { ok: true, formulas: ['MDC: algoritmo de Euclides', 'MMC(a, b) = |a·b| / MDC(a, b)'],
        steps: [`MDC(${fmt(a!)}, ${fmt(b!)}) = ${fmt(gcd(a!, b!))}`, `MMC(${fmt(a!)}, ${fmt(b!)}) = ${fmt(m)}`],
        outputs: [{ label: 'MDC', value: fmt(gcd(a!, b!)) }, { label: 'MMC', value: fmt(m) }],
        notes: ['Convenções: sinais são ignorados (resultados não negativos); MMC(a, 0) = 0; MDC(0, 0) = 0.'] }
    },
  },
  fatoracao: {
    fields: [{ id: 'n', label: 'Número inteiro' }],
    compute: ({ n }) => {
      const r = factorize(n!); if (!r.ok) return err(r.error)
      const txt = r.factors.map(f => (f.exp > 1 ? `${f.p}^${f.exp}` : `${f.p}`)).join(' · ')
      const prime = !r.negative && r.factors.length === 1 && r.factors[0].exp === 1
      return { ok: true, formulas: ['Divisão sucessiva por primos'],
        steps: [r.factors.length ? `|${fmt(n!)}| = ${txt}` : '1 não possui fatores primos.'],
        outputs: [{ label: 'Fatoração', value: (r.negative ? '−1 · ' : '') + (txt || '1') }, { label: 'É primo?', value: prime ? 'Sim' : 'Não' }],
        notes: ['Números negativos: fatora-se o valor absoluto e o sinal aparece como −1. Limite: |n| ≤ 10¹².'] }
    },
  },
  'regra-de-tres': {
    fields: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b (corresponde a a)' }, { id: 'c', label: 'c' },
      { id: 'inv', label: 'Tipo', options: [{ value: 0, label: 'Direta' }, { value: 1, label: 'Inversa' }] }],
    compute: ({ a, b, c, inv }) => {
      const r = ruleOfThree(a!, b!, c!, inv === 1); if (!r.ok) return err(r.error)
      return { ok: true, formulas: [inv === 1 ? 'x = a·b / c' : 'x = b·c / a'],
        steps: [inv === 1 ? `x = (${fmt(a!)} · ${fmt(b!)}) / ${fmt(c!)} = ${fmt(r.x)}` : `x = (${fmt(b!)} · ${fmt(c!)}) / ${fmt(a!)} = ${fmt(r.x)}`],
        outputs: [{ label: 'x', value: fmt(r.x) }], notes: ['Regra composta ainda não implementada.'] }
    },
  },
  'equacao-1grau': {
    fields: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c (lado direito)' }],
    compute: ({ a, b, c }) => {
      const s = solveLinear(a!, b!, c!), eq = `${fmt(a!)}x + ${fmt(b!)} = ${fmt(c!)}`
      const f = { ok: true as const, formulas: ['ax + b = c  ⇒  x = (c − b) / a'] }
      if (s.kind === 'all') return { ...f, steps: [eq, 'a = 0 e b = c: vale para qualquer x.'], outputs: [{ label: 'Solução', value: 'Infinitas soluções (todos os reais)' }] }
      if (s.kind === 'none') return { ...f, steps: [eq, 'a = 0 e b ≠ c: igualdade impossível.'], outputs: [{ label: 'Solução', value: 'Sem solução' }] }
      return { ...f, steps: [eq, `x = (${fmt(c!)} − ${fmt(b!)}) / ${fmt(a!)} = ${fmt(s.x)}`], outputs: [{ label: 'x', value: fmt(s.x) }],
        notes: [`Verificação: ${fmt(a!)}·${fmt(s.x)} + ${fmt(b!)} ≈ ${fmt(a! * s.x + b!)}`] }
    },
  },

  'conversao-unidades': {
    fields: [{ id: 'v', label: 'Valor' }, { id: 'de', label: 'De', options: unitOpts }, { id: 'para', label: 'Para', options: unitOpts }],
    compute: ({ v, de, para }) => {
      const a = UNITS[de!], b = UNITS[para!], r = convert(v!, a, b)
      if (!r.ok) return err(r.error)
      return { ok: true, formulas: a.dim === 'Temperatura' ? ['Conversão via Kelvin (relação afim)'] : ['valor · fator(origem) / fator(destino)'],
        steps: [`${fmt(v!)} ${a.label} → ${fmt(r.value, 10)} ${b.label}`], outputs: [{ label: b.label, value: fmt(r.value, 10) }],
        notes: ['Cálculo em ponto flutuante (≈15 dígitos significativos). Só unidades da mesma grandeza são convertidas.'] }
    },
  },
  'variacao-percentual': {
    fields: [{ id: 'a', label: 'Valor inicial' }, { id: 'b', label: 'Valor final' }],
    compute: ({ a, b }) => calcOut(pctChange(a!, b!), 'Variação', 'Δ% = (final − inicial) / |inicial| · 100', `Δ% = (${fmt(b!)} − ${fmt(a!)}) / |${fmt(a!)}| · 100 = {r}%`, '%'),
  },
  'desconto-acrescimo': {
    fields: [{ id: 'v', label: 'Valor', unit: 'R$' }, { id: 'p', label: 'Porcentagem', unit: '%' }, { id: 'm', label: 'Tipo', options: modeOpts }],
    compute: ({ v, p, m }) => calcOut(applyPct(v!, p!, m === 1 ? 'increase' : 'discount'), 'Valor final', 'final = V · (1 ∓ p/100)', `final = ${fmt(v!)} · (1 ${m === 1 ? '+' : '−'} ${fmt(p! / 100)}) = {r}`),
  },
  'valor-original': {
    fields: [{ id: 'f', label: 'Valor final', unit: 'R$' }, { id: 'p', label: 'Porcentagem aplicada', unit: '%' }, { id: 'm', label: 'Tipo', options: modeOpts }],
    compute: ({ f, p, m }) => calcOut(originalValue(f!, p!, m === 1 ? 'increase' : 'discount'), 'Valor original', 'original = final / (1 ∓ p/100)', `original = ${fmt(f!)} / (1 ${m === 1 ? '+' : '−'} ${fmt(p! / 100)}) = {r}`),
  },
  'margem-markup': {
    fields: [{ id: 'c', label: 'Preço de custo', unit: 'R$' }, { id: 'p', label: 'Preço de venda', unit: 'R$' }],
    compute: ({ c, p }) => {
      const r = marginMarkup(c!, p!); if (!r.ok) return err(r.error)
      return { ok: true, formulas: ['lucro = venda − custo', 'margem = lucro / venda · 100', 'markup = lucro / custo · 100'],
        steps: [`lucro = ${fmt(p!)} − ${fmt(c!)} = ${fmt(r.profit)}`, `margem = ${fmt(r.profit)} / ${fmt(p!)} = ${fmt(r.margin)}%`, `markup = ${fmt(r.profit)} / ${fmt(c!)} = ${fmt(r.markup)}%`],
        outputs: [{ label: 'Lucro', value: fmt(r.profit, 2) }, { label: 'Margem (sobre a venda)', value: fmt(r.margin, 4) + '%' }, { label: 'Markup (sobre o custo)', value: fmt(r.markup, 4) + '%' }] }
    },
  },

  'funcao-afim': {
    fields: [{ id: 'a', label: 'a (coeficiente angular)' }, { id: 'b', label: 'b (coeficiente linear)' }],
    compute: ({ a, b }) => out(['f(x) = ax + b', 'raiz: x = −b/a'],
      [`f(x) = ${num(a!)}x + ${num(b!)}`, a === 0 ? 'a = 0: função constante, sem raiz única.' : `x = −${num(b!)} / ${num(a!)} = ${num(-b! / a!)}`],
      [['Raiz', a === 0 ? (b === 0 ? 'Todos os reais' : 'Nenhuma') : num(-b! / a!)], ['Intercepto y', num(b!)], ['Comportamento', a! > 0 ? 'Crescente' : a! < 0 ? 'Decrescente' : 'Constante']],
      ['Para ver o gráfico, use o Construtor de gráficos.']),
  },
  'funcao-quadratica': {
    fields: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c' }],
    compute: ({ a, b, c }) => {
      if (a === 0) return err('Para ser quadrática, a deve ser diferente de zero.')
      const q = solveQuadratic(a!, b!, c!), delta = b! * b! - 4 * a! * c!, xv = -b! / (2 * a!), yv = -delta / (4 * a!)
      const roots = q.kind === 'two-real' ? `${num(q.x1)} e ${num(q.x2)}` : q.kind === 'one-real' ? num(q.x) : 'Sem raízes reais'
      return out(['Δ = b² − 4ac', 'V = (−b/2a, −Δ/4a)'], [`Δ = ${num(delta)}`, `xv = ${num(xv)}, yv = ${num(yv)}`],
        [['Discriminante Δ', num(delta)], ['Raízes reais', roots], ['Vértice', `(${num(xv)}, ${num(yv)})`], ['Eixo de simetria', `x = ${num(xv)}`], ['Concavidade', a! > 0 ? 'Para cima (mínimo)' : 'Para baixo (máximo)'], ['Intercepto y', num(c!)]])
    },
  },
  circulo: {
    fields: [{ id: 'r', label: 'Raio', unit: 'u' }],
    compute: ({ r }) => needPos(r) ?? (() => { const x = S.circle(r!); return out(['d = 2r', 'C = 2πr', 'A = πr²'], [`A = π · ${num(r!)}² = ${num(x.a)}`], [['Diâmetro', num(x.d)], ['Comprimento', num(x.c)], ['Área', num(x.a) + ' u²']], ['Valores com π aproximado em ponto flutuante.']) })(),
  },
  'poligono-regular': {
    fields: [{ id: 'n', label: 'Número de lados (≥ 3)' }, { id: 'l', label: 'Lado', unit: 'u' }],
    compute: ({ n, l }) => {
      if (!Number.isInteger(n) || n! < 3) return err('O número de lados deve ser um inteiro ≥ 3.')
      const bad = needPos(l); if (bad) return bad
      const x = S.regularPolygon(n!, l!)
      return out(['P = n·l', 'apótema = l / (2·tan(π/n))', 'A = P·apótema / 2', 'Σ ângulos = (n−2)·180°', 'diagonais = n(n−3)/2'], [`apótema = ${num(x.apothem)}`, `A = ${num(x.perimeter)} · ${num(x.apothem)} / 2 = ${num(x.area)}`],
        [['Perímetro', num(x.perimeter)], ['Apótema', num(x.apothem)], ['Área', num(x.area) + ' u²'], ['Soma dos ângulos internos', num(x.angleSum) + '°'], ['Ângulo interno', num(x.interior) + '°'], ['Diagonais', num(x.diagonals)]])
    },
  },
  cubo: { fields: [{ id: 'a', label: 'Aresta', unit: 'u' }], compute: ({ a }) => needPos(a) ?? (() => { const x = S.cube(a!); return out(['V = a³', 'A = 6a²', 'd = a√3'], [`V = ${num(a!)}³ = ${num(x.v)}`], [['Volume', num(x.v) + ' u³'], ['Área total', num(x.a) + ' u²'], ['Diagonal', num(x.d)]]) })() },
  esfera: { fields: [{ id: 'r', label: 'Raio', unit: 'u' }], compute: ({ r }) => needPos(r) ?? (() => { const x = S.sphere(r!); return out(['V = 4πr³/3', 'A = 4πr²'], [`V = 4π · ${num(r!)}³ / 3 = ${num(x.v)}`], [['Volume', num(x.v) + ' u³'], ['Área da superfície', num(x.a) + ' u²']]) })() },
  cilindro: { fields: [{ id: 'r', label: 'Raio', unit: 'u' }, { id: 'h', label: 'Altura', unit: 'u' }], compute: ({ r, h }) => needPos(r, h) ?? (() => { const x = S.cylinder(r!, h!); return out(['V = πr²h', 'Alat = 2πrh', 'Atot = 2πr(r + h)'], [`V = π · ${num(r!)}² · ${num(h!)} = ${num(x.v)}`], [['Volume', num(x.v) + ' u³'], ['Área lateral', num(x.lat) + ' u²'], ['Área total', num(x.tot) + ' u²']]) })() },
  cone: { fields: [{ id: 'r', label: 'Raio da base', unit: 'u' }, { id: 'h', label: 'Altura', unit: 'u' }], compute: ({ r, h }) => needPos(r, h) ?? (() => { const x = S.cone(r!, h!); return out(['g = √(r² + h²)', 'V = πr²h/3', 'Alat = πrg', 'Atot = πr(r + g)'], [`g = ${num(x.g)}`, `V = ${num(x.v)}`], [['Geratriz', num(x.g)], ['Volume', num(x.v) + ' u³'], ['Área lateral', num(x.lat) + ' u²'], ['Área total', num(x.tot) + ' u²']]) })() },
  'graus-radianos': {
    fields: [{ id: 'v', label: 'Valor' }, { id: 'd', label: 'Converter', options: [{ value: 0, label: 'Graus → radianos' }, { value: 1, label: 'Radianos → graus' }] }],
    compute: ({ v, d }) => d === 1 ? out(['graus = rad · 180/π'], [`${num(v!)} · 180/π`], [['Graus', num((v! * 180) / Math.PI, 10) + '°']], ['Aproximação decimal.'])
      : out(['rad = graus · π/180'], [`${num(v!)} · π/180`], [['Radianos', num((v! * Math.PI) / 180, 10) + ' rad'], ['Em múltiplos de π', num(v! / 180, 10) + 'π']], ['Aproximação decimal.']),
  },
  'razoes-trigonometricas': {
    fields: [{ id: 'a', label: 'Ângulo' }, { id: 'u', label: 'Unidade', options: [{ value: 0, label: 'Graus' }, { value: 1, label: 'Radianos' }] }],
    compute: ({ a, u }) => { const r = S.trigRatios(u === 1 ? a! : (a! * Math.PI) / 180)
      return out(['sen, cos, tan do ângulo'], [`Ângulo em radianos = ${num(u === 1 ? a! : (a! * Math.PI) / 180, 10)}`], [['sen', num(r.sin, 10)], ['cos', num(r.cos, 10)], ['tan', r.tan === null ? 'Indefinida' : num(r.tan, 10)]], ['Ruído menor que 10⁻¹² é exibido como 0.']) },
  },
  combinatoria: {
    fields: [{ id: 'n', label: 'n (total de elementos)' }, { id: 'k', label: 'k (elementos escolhidos)' }],
    compute: ({ n, k }) => { const r = S.combinatorics(n!, k!); if (!r.ok) return err(r.error)
      const g = (x: bigint) => x.toLocaleString('pt-BR')
      return out(['P(n) = n!', 'A(n,k) = n!/(n−k)!', 'C(n,k) = n!/(k!(n−k)!)'], [`n = ${n}, k = ${k}`], [['Permutações P(n)', g(r.permutation)], ['Arranjos A(n,k)', g(r.arrangement)], ['Combinações C(n,k)', g(r.combination)]], ['Cálculo exato com inteiros de precisão arbitrária.']) },
  },
  'segunda-lei-newton': {
    fields: [{ id: 'm', label: 'Massa', unit: 'kg' }, { id: 'a', label: 'Aceleração', unit: 'm/s²' }],
    compute: ({ m, a }) => (m! < 0 ? err('A massa não pode ser negativa.') : out(['F = m · a'], [`F = ${num(m!)} · ${num(a!)} = ${num(m! * a!)}`], [['Força resultante', num(m! * a!) + ' N']], ['Modelo idealizado: força resultante constante, massa constante, velocidades muito menores que a da luz.'])),
  },
  'energia-cinetica': {
    fields: [{ id: 'm', label: 'Massa', unit: 'kg' }, { id: 'v', label: 'Velocidade', unit: 'm/s' }],
    compute: ({ m, v }) => (m! < 0 ? err('A massa não pode ser negativa.') : out(['Ec = ½ · m · v²'], [`Ec = ½ · ${num(m!)} · ${num(v!)}² = ${num(0.5 * m! * v! ** 2)}`], [['Energia cinética', num(0.5 * m! * v! ** 2) + ' J']], ['Vale para velocidades muito menores que a da luz.'])),
  },
  'lei-ohm': {
    fields: [{ id: 'V', label: 'Tensão', unit: 'V', optional: true }, { id: 'I', label: 'Corrente', unit: 'A', optional: true }, { id: 'R', label: 'Resistência', unit: 'Ω', optional: true }],
    compute: ({ V, I, R }) => {
      if ([V, I, R].filter(x => x !== undefined).length !== 2) return err('Preencha exatamente dois valores e deixe o terceiro em branco.')
      if (R !== undefined && R <= 0) return err('A resistência deve ser positiva.')
      if (I === undefined) return out(['I = V / R'], [`I = ${num(V!)} / ${num(R!)}`], [['Corrente', num(V! / R!) + ' A']], ['Resistor ôhmico, temperatura constante.'])
      if (V === undefined) return out(['V = R · I'], [`V = ${num(R!)} · ${num(I)}`], [['Tensão', num(R! * I) + ' V']], ['Resistor ôhmico, temperatura constante.'])
      if (I === 0) return err('Com corrente zero a resistência é indeterminada.')
      return out(['R = V / I'], [`R = ${num(V)} / ${num(I)}`], [['Resistência', num(V / I) + ' Ω']], ['Resistor ôhmico, temperatura constante.'])
    },
  },
  porcentagem: {
    fields: [{ id: 'p', label: 'Porcentagem', unit: '%' }, { id: 'v', label: 'Valor' }],
    compute: ({ p, v }) => {
      const r = percentOf(p!, v!)
      return { ok: true, formulas: ['resultado = (p / 100) · V'], steps: [`(${fmt(p!)} / 100) · ${fmt(v!)} = ${fmt(r)}`], outputs: [{ label: `${fmt(p!)}% de ${fmt(v!)}`, value: fmt(r) }] }
    },
  },
}

const merged: Record<string, ToolModule> = { ...base, ...advanced, ...Object.fromEntries(allDefs.map(d => [d.meta.id, d.mod])) }
/** Cada módulo calcula como antes; o resultado ganha gráfico/comparação gerados das mesmas entradas. */
export const modules: Record<string, ToolModule> = Object.fromEntries(Object.entries(merged).map(([id, m]) => [id,
  { ...m, compute: (v, t) => { const r = m.compute(v, t); return r.ok ? { ...r, ...visualFor(id, v, t ?? {}) } : r } }]))

/** Ferramentas com interface própria (não são formulários numéricos). Ver src/features/Calculator.tsx */
export const customTools: string[] = ['calculadora-basica', 'calculadora-cientifica', 'grafico-funcoes']
