import type { ToolModule, Result } from '../core/types.ts'
import { fmt } from '../core/format.ts'
import * as C from '../core/calculus.ts'
import * as D from '../core/discrete.ts'
import * as ST from '../core/stats.ts'

const err = (error: string): Result => ({ ok: false, error })
const msg = (e: unknown) => (e instanceof Error ? e.message : 'Expressão inválida.')
const f = { id: 'f', label: 'f(x)', text: true }
const n6 = (x: number) => fmt(x, 8)
const set = (a: string[]) => `{${a.join(', ')}}`
const base = (v: number) => ({ value: v, label: `Base ${v}` })
const baseOpts = [base(10), base(2), base(8), base(16)]

export const advanced: Record<string, ToolModule> = {
  derivada: {
    fields: [f, { id: 'x0', label: 'Ponto x₀ (opcional)', optional: true }, { id: 'ord', label: 'Ordem', options: [{ value: 1, label: '1ª derivada' }, { value: 2, label: '2ª derivada' }, { value: 3, label: '3ª derivada' }] }],
    compute: ({ x0, ord }, t) => { try {
      const fx = C.parse(t!.f), dn = C.derivN(fx, ord!), outs = [{ label: `f${'′'.repeat(ord!)}(x)`, value: C.str(dn) }]
      const steps = [`f(x) = ${C.str(fx)}`, `Regras: ${C.rulesOf(fx).join('; ') || 'derivada de constante ou de x'}`, `f${'′'.repeat(ord!)}(x) = ${C.str(dn)}`]
      if (x0 !== undefined) {
        const y = C.evalNode(fx, x0), m = C.evalNode(C.deriv(fx), x0), v = C.evalNode(dn, x0)
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(v)) return err('A função ou a derivada não é definida em x₀.')
        outs.push({ label: `f${'′'.repeat(ord!)}(x₀)`, value: n6(v) }, { label: 'Reta tangente em x₀', value: `y = ${n6(m)}·(x − ${n6(x0)}) + ${n6(y)}` })
        steps.push(`Em x₀ = ${n6(x0)}: f(x₀) = ${n6(y)}, f′(x₀) = ${n6(m)}`)
      }
      return { ok: true, outputs: outs, steps, formulas: ['(u+v)′ = u′+v′', '(uv)′ = u′v + uv′', '(u/v)′ = (u′v − uv′)/v²', '(g∘u)′ = g′(u)·u′'],
        notes: ['Derivada simbólica exata dentro do conjunto: x, constantes, + − * / ^, sin, cos, tan, exp, ln, sqrt, abs. Ângulos em radianos. A expressão resultante é simplificada só parcialmente.'] } } catch (e) { return err(msg(e)) } },
  },
  'integral-indefinida': {
    fields: [f],
    compute: (_, t) => { try {
      const fx = C.parse(t!.f), F = C.antiderivative(fx)
      return { ok: true, formulas: ['∫xⁿ dx = xⁿ⁺¹/(n+1) + C', '∫1/x dx = ln|x| + C', '∫sen x = −cos x + C', '∫cos x = sen x + C', '∫eˣ = eˣ + C'],
        steps: [`f(x) = ${C.str(fx)}`, `F(x) = ${C.str(F)} + C`], outputs: [{ label: '∫ f(x) dx', value: `${C.str(F)} + C` }],
        notes: ['Subconjunto suportado: combinações lineares de x^n, 1/x, sin(x), cos(x) e exp(x). Fora disso o sistema recusa em vez de inventar um resultado.'] } } catch (e) { return err(msg(e)) } },
  },
  'integral-definida': {
    fields: [f, { id: 'a', label: 'Limite inferior a' }, { id: 'b', label: 'Limite superior b' },
      { id: 'm', label: 'Método numérico', options: [{ value: 0, label: 'Simpson (n = 1000)' }, { value: 1, label: 'Trapézio (n = 1000)' }] }],
    compute: ({ a, b, m }, t) => { try {
      if (a === b) return { ok: true, formulas: ['∫ₐᵃ f = 0'], steps: ['Limites iguais'], outputs: [{ label: 'Integral', value: '0' }] }
      const fx = C.parse(t!.f), val = C.integrate(fx, a!, b!, m === 1 ? 'trapezoid' : 'simpson')
      const outs = [{ label: 'Valor numérico', value: n6(val) }], steps = [`f(x) = ${C.str(fx)} em [${n6(a!)}, ${n6(b!)}]`, `${m === 1 ? 'Trapézio' : 'Simpson'} com n = 1000: ${n6(val)}`]
      try { const F = C.antiderivative(fx), ex = C.evalNode(F, b!) - C.evalNode(F, a!)
        if (Number.isFinite(ex)) { outs.push({ label: 'Valor exato (F(b) − F(a))', value: n6(ex) }); steps.push(`F(x) = ${C.str(F)}; F(b) − F(a) = ${n6(ex)}`) } } catch { /* sem antiderivada simbólica: só numérico */ }
      return { ok: true, formulas: ['Simpson: (h/3)[f₀ + 4f₁ + 2f₂ + … + fₙ]', 'Trapézio: (h/2)[f₀ + 2f₁ + … + fₙ]', 'TFC: ∫ₐᵇ f = F(b) − F(a)'], steps, outputs: outs,
        notes: ['O valor numérico é aproximação (erro menor em funções suaves). Se f tiver singularidade em [a, b], a ferramenta recusa. Área geométrica ≠ integral quando f muda de sinal.'] } } catch (e) { return err(msg(e)) } },
  },
  'limite-numerico': {
    fields: [f, { id: 'a', label: 'Ponto a (x → a)' }],
    compute: ({ a }, t) => { try {
      const fx = C.parse(t!.f), l = C.limitNumeric(fx, a!), s = (x: C.Side) => (x.value === null ? x.note : n6(x.value))
      return { ok: true, formulas: ['lim x→a⁻ f(x)', 'lim x→a⁺ f(x)'], steps: [`f(x) = ${C.str(fx)}`, `Avalia f em a ± 10⁻³, 10⁻⁵, 10⁻⁷ e verifica se estabiliza`],
        outputs: [{ label: 'Limite lateral esquerdo', value: s(l.left) }, { label: 'Limite lateral direito', value: s(l.right) }, { label: 'Limite', value: l.agree ? n6(l.value!) : 'Não foi possível concluir que existe' }],
        notes: ['Estimativa numérica, não prova. Cancelamento em ponto flutuante pode afetar casos muito sensíveis; laterais diferentes significam que o limite não existe.'] } } catch (e) { return err(msg(e)) } },
  },
  'raiz-newton': {
    fields: [f, { id: 'x0', label: 'Chute inicial x₀' }],
    compute: ({ x0 }, t) => { try {
      const fx = C.parse(t!.f), r = C.newton(fx, x0!); if (!r.ok) return err(r.error)
      return { ok: true, formulas: ['xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)'], steps: [`f(x) = ${C.str(fx)}`, `f′(x) = ${C.str(C.deriv(fx))}`, `Convergiu em ${r.iterations} iterações`],
        outputs: [{ label: 'Raiz aproximada', value: fmt(r.root, 12) }, { label: 'f(raiz)', value: r.residual.toExponential(3) }],
        notes: ['Newton converge para a raiz mais próxima do chute, não necessariamente a única. Tolerância 10⁻¹².'] } } catch (e) { return err(msg(e)) } },
  },
  'tabela-verdade': {
    fields: [{ id: 'e', label: 'Expressão lógica', text: true }],
    compute: (_, t) => { try {
      const r = D.truthTable(t!.e), V = (b: boolean) => (b ? 'V' : 'F')
      return { ok: true, formulas: ['! não · & e · | ou · ^ ou exclusivo · -> implica · <-> bicondicional'], steps: [`Variáveis: ${r.vars.join(', ')} → ${r.rows.length} linhas`],
        outputs: [{ label: 'Classificação', value: r.kind }], table: { head: [...r.vars, t!.e.trim()], rows: r.rows.map(x => [...r.vars.map(v => V(x.env[v])), V(x.out)]) },
        notes: ['Precedência: ! > & > | e ^ > -> (associa à direita) > <->. Use parênteses na dúvida. Máximo de 6 variáveis.'] } } catch (e) { return err(msg(e)) } },
  },
  'equivalencia-logica': {
    fields: [{ id: 'a', label: 'Expressão A', text: true }, { id: 'b', label: 'Expressão B', text: true }],
    compute: (_, t) => { try {
      const r = D.equivalent(t!.a, t!.b)
      return { ok: true, formulas: ['A ≡ B quando têm a mesma tabela-verdade'], steps: [`Compara ${2 ** r.vars.length} valorações das variáveis ${r.vars.join(', ')}`],
        outputs: [{ label: 'Resultado', value: r.equivalent ? 'Equivalentes' : 'Não equivalentes' }, ...(r.counterexample ? [{ label: 'Contraexemplo', value: r.vars.map(v => `${v}=${r.counterexample![v] ? 'V' : 'F'}`).join(', ') }] : [])],
        notes: ['Verificação exaustiva (finita), logo exata.'] } } catch (e) { return err(msg(e)) } },
  },
  conjuntos: {
    fields: [{ id: 'A', label: 'Conjunto A (separe por vírgula)', text: true }, { id: 'B', label: 'Conjunto B', text: true }],
    compute: (_, t) => {
      const A = D.parseSet(t!.A), B = D.parseSet(t!.B)
      if (A.length > 20 || B.length > 20) return err('Limite: 20 elementos por conjunto.')
      const o = D.setOps(A, B), P = o.powerSize <= 32 ? ` — ${o.powerSize} subconjuntos` : ` — ${o.powerSize} subconjuntos`
      return { ok: true, formulas: ['|A ∪ B| = |A| + |B| − |A ∩ B|', '|P(A)| = 2^|A|', '|A × B| = |A|·|B|'], steps: [`A = ${set(A)}, B = ${set(B)}`, `|A| = ${A.length}, |B| = ${B.length}`],
        outputs: [{ label: 'A ∪ B', value: set(o.union) }, { label: 'A ∩ B', value: set(o.inter) }, { label: 'A − B', value: set(o.aMinusB) }, { label: 'B − A', value: set(o.bMinusA) }, { label: 'A Δ B', value: set(o.sym) },
          { label: 'A ⊆ B ?', value: o.aSubB ? 'Sim' : 'Não' }, { label: 'B ⊆ A ?', value: o.bSubA ? 'Sim' : 'Não' }, { label: 'Partes de A', value: `P(A)${P}` }, { label: '|A × B|', value: String(o.cartesian) }],
        notes: ['Elementos iguais como texto são o mesmo elemento ("1" e "01" são diferentes). Números são ordenados numericamente.'] }
    },
  },
  'bases-numericas': {
    fields: [{ id: 'v', label: 'Número', text: true }, { id: 'b', label: 'Base do número', options: baseOpts }],
    compute: ({ b }, t) => {
      const r = D.parseBase(t!.v, b!); if (!r.ok) return err(r.error)
      return { ok: true, formulas: ['valor = Σ dígito · baseᵖᵒˢⁱᶜᵃᵒ'], steps: [`${t!.v.trim()} (base ${b}) = ${r.value.toString()} (decimal)`],
        outputs: [10, 2, 8, 16].map(x => ({ label: `Base ${x}`, value: D.toBase(r.value, x) })), notes: ['Inteiros de precisão arbitrária. Negativos aparecem com sinal "−" (sinal-magnitude).'] }
    },
  },
  'aritmetica-modular': {
    fields: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b (expoente ≥ 0)' }, { id: 'm', label: 'Módulo m (≥ 1)' }],
    compute: ({ a, b, m }) => {
      if (![a, b, m].every(Number.isSafeInteger)) return err('Informe inteiros (até 2⁵³−1).')
      if (m! < 1) return err('O módulo deve ser ≥ 1.')
      if (b! < 0) return err('O expoente deve ser ≥ 0 (para inverso use a ferramenta com b qualquer: o inverso é de a).')
      const A = BigInt(a!), Bb = BigInt(b!), M = BigInt(m!), md = (x: bigint) => ((x % M) + M) % M, inv = D.modInverse(A, M)
      return { ok: true, formulas: ['(a + b) mod m', '(a · b) mod m', 'aᵇ mod m (exponenciação rápida)', 'a⁻¹: a·x ≡ 1 (mod m), existe ⇔ mdc(a, m) = 1'], steps: [`Resto sempre em [0, ${m! - 1}] (convenção matemática, mesmo para a negativo)`],
        outputs: [{ label: '(a + b) mod m', value: md(A + Bb).toString() }, { label: '(a · b) mod m', value: md(A * Bb).toString() }, { label: 'aᵇ mod m', value: D.modPow(A, Bb, M).toString() },
          { label: 'mdc(a, m)', value: D.gcdB(A, M).toString() }, { label: 'Inverso de a mod m', value: inv === null ? 'Não existe (mdc ≠ 1)' : inv.toString() }] }
    },
  },
  'pa-pg': {
    fields: [{ id: 'k', label: 'Tipo', options: [{ value: 0, label: 'Progressão aritmética (PA)' }, { value: 1, label: 'Progressão geométrica (PG)' }] },
      { id: 'a1', label: 'Primeiro termo a₁' }, { id: 'r', label: 'Razão r' }, { id: 'n', label: 'Número de termos n (1 a 1000)' }],
    compute: ({ k, a1, r, n }) => {
      if (!Number.isInteger(n) || n! < 1 || n! > 1000) return err('n deve ser inteiro entre 1 e 1000.')
      const x = D.progression(k === 1 ? 'pg' : 'pa', a1!, r!, n!)
      if (!Number.isFinite(x.an) || !Number.isFinite(x.sn)) return err('Resultado fora do limite numérico.')
      const pa = k !== 1
      return { ok: true, formulas: pa ? ['aₙ = a₁ + (n−1)·r', 'Sₙ = n(a₁ + aₙ)/2'] : ['aₙ = a₁ · rⁿ⁻¹', 'Sₙ = a₁(rⁿ − 1)/(r − 1), r ≠ 1; Sₙ = n·a₁ se r = 1'],
        steps: [`aₙ = ${fmt(x.an, 10)}`, `Sₙ = ${fmt(x.sn, 10)}`], outputs: [{ label: 'Termo aₙ', value: fmt(x.an, 10) }, { label: 'Soma Sₙ', value: fmt(x.sn, 10) }],
        notes: [pa ? 'Ponto flutuante: inteiros exatos até 2⁵³.' : `Ponto flutuante.${Math.abs(r!) < 1 ? ` Para n → ∞ a soma converge para ${fmt(a1! / (1 - r!), 10)}.` : ''}`] }
    },
  },
  fibonacci: {
    fields: [{ id: 'n', label: 'n (0 a 1000)' }],
    compute: ({ n }) => (!Number.isInteger(n) || n! < 0 || n! > 1000 ? err('n deve ser inteiro entre 0 e 1000.')
      : { ok: true, formulas: ['F(0) = 0, F(1) = 1', 'F(n) = F(n−1) + F(n−2)'], steps: [`Iteração com inteiros exatos até n = ${n}`], outputs: [{ label: `F(${n})`, value: D.fibonacci(n!).toLocaleString('pt-BR') }] }),
  },
  'estatistica-descritiva': {
    fields: [{ id: 'dados', label: 'Dados (separe por espaço, linha ou ;)', text: true }, { id: 'p', label: 'Percentil desejado (0 a 100, opcional)', optional: true }],
    compute: ({ p }, t) => {
      const parsed = ST.parseData(t!.dados); if (!parsed.ok) return err(parsed.error)
      if (p !== undefined && (p < 0 || p > 100)) return err('O percentil deve estar entre 0 e 100.')
      const d = ST.describe(parsed.values), n = (x: number) => fmt(x, 8), fr = ST.frequencies(d.sorted)
      const max = Math.max(...fr.map(x => x.count)); let acc = 0
      const outs = [{ label: 'n (quantidade)', value: String(d.n) }, { label: 'Média', value: n(d.mean) }, { label: 'Mediana', value: n(d.median) },
        { label: 'Moda', value: d.modes.length ? d.modes.map(n).join(' ; ') : 'Não há moda (sem repetições)' }, { label: 'Mínimo / Máximo', value: `${n(d.min)} / ${n(d.max)}` }, { label: 'Amplitude', value: n(d.range) },
        { label: 'Variância populacional', value: n(d.varPop) }, { label: 'Desvio-padrão populacional', value: n(d.sdPop) },
        { label: 'Variância amostral', value: d.varSample === null ? 'Indefinida (n = 1)' : n(d.varSample) }, { label: 'Desvio-padrão amostral', value: d.sdSample === null ? 'Indefinido (n = 1)' : n(d.sdSample) },
        { label: 'Q1 / Q2 / Q3', value: `${n(d.q1)} / ${n(d.q2)} / ${n(d.q3)}` }, { label: 'Intervalo interquartil', value: n(d.iqr) },
        { label: 'Valores atípicos (1,5 × IIQ)', value: d.outliers.length ? d.outliers.slice(0, 10).map(n).join(' ; ') : 'Nenhum' }]
      if (p !== undefined) outs.push({ label: `Percentil ${n(p)}`, value: n(ST.percentile(d.sorted, p)) })
      return { ok: true, formulas: ['x̄ = Σx / n', 'σ² = Σ(x − x̄)² / n  (população)', 's² = Σ(x − x̄)² / (n − 1)  (amostra)', 'Percentil: interpolação linear em h = (n − 1)·p/100'],
        steps: [`n = ${d.n}; soma = ${n(d.mean * d.n)}; média = ${n(d.mean)}`, `Σ(x − x̄)² = ${n(d.varPop * d.n)}`, `Dados ordenados: ${d.sorted.slice(0, 12).map(n).join(', ')}${d.n > 12 ? ', …' : ''}`],
        outputs: outs, table: { head: ['Valor / classe', 'Freq. absoluta', 'Freq. relativa', 'Acumulada', 'Distribuição'], rows: fr.map(x => { acc += x.count; return [x.label, String(x.count), `${fmt((x.count / d.n) * 100, 2)}%`, `${fmt((acc / d.n) * 100, 2)}%`, '█'.repeat(Math.max(1, Math.round((x.count / max) * 20)))] }) },
        notes: ['Use as medidas populacionais quando os dados são todos os elementos de interesse e as amostrais (n − 1) quando são uma amostra de um conjunto maior.', 'Quartis pelo método inclusivo (Excel QUARTIL.INC, R tipo 7); outros programas podem diferir ligeiramente.', d.outliers.length ? 'Há valores atípicos: a média e o desvio-padrão são sensíveis a eles; a mediana e o IIQ são mais robustos.' : 'Sem valores atípicos pela regra de 1,5 × IIQ.'] }
    },
  },
}
