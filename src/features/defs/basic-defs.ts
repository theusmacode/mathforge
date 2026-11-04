import { def, F, SEL, err, n, res, chk, type Def } from './kit.ts'
const b = 'basica'
/** Arredondamento decimal exato a partir da representação decimal mais curta do número. */
export function roundDecimal(x: number, places: number, mode: number): string | null {
  const s = String(Math.abs(x)); if (/e/i.test(s)) return null
  const [ip, fp = ''] = s.split('.'), neg = x < 0, N = BigInt(ip + fp), sc = fp.length
  let q = N, up = false
  if (sc > places) { const div = 10n ** BigInt(sc - places), r = N % div, half = div / 2n; q = N / div
    up = mode === 0 ? r >= half : mode === 1 ? r > half || (r === half && q % 2n === 1n) : mode === 2 ? neg && r > 0n : mode === 3 ? !neg && r > 0n : false; if (up) q += 1n }
  else q = N * 10n ** BigInt(places - sc)
  const str = q.toString().padStart(places + 1, '0'), out = places ? `${str.slice(0, -places)},${str.slice(-places)}` : str
  return (neg && q !== 0n ? '-' : '') + out
}
export const basicDefs: Def[] = [
  def('divisores-multiplos', 'Divisores e múltiplos', b, 'Números inteiros', 'div', 'Todos os divisores, soma, classificação e primeiros múltiplos.', ['divisores', 'múltiplos', 'número perfeito', 'primo'], [F('n|Número inteiro positivo (até 10⁹)')],
    ({ n: N }) => { if (!Number.isInteger(N) || N! < 1 || N! > 1e9) return err('Informe um inteiro de 1 a 1 000 000 000.'); const d: number[] = []; for (let i = 1; i * i <= N!; i++) if (N! % i === 0) { d.push(i); if (i * i !== N) d.push(N! / i) } d.sort((x, y) => x - y)
      const s = d.reduce((a, x) => a + x, 0) - N!; return res([['Divisores', d.slice(0, 200).join(', ') + (d.length > 200 ? ', …' : '')], ['Quantidade', String(d.length)], ['Soma dos divisores próprios', String(s)], ['Classificação', N === 1 ? 'Unidade' : d.length === 2 ? 'Primo' : s === N ? 'Número perfeito' : s > N! ? 'Abundante' : 'Deficiente'], ['10 primeiros múltiplos', Array.from({ length: 10 }, (_, i) => N! * (i + 1)).join(', ')]], ['d divide n se n mod d = 0 (testa até √n)'], []) }),
  def('potencia-raiz', 'Potência e raiz enésima', b, 'Calculadoras', 'xⁿ', 'aⁿ e ⁿ√a com tratamento de sinais.', ['potência', 'raiz', 'radiciação', 'expoente'], [F('a|Base a'), F('k|Expoente / índice n')],
    ({ a, k }) => { const out: [string, string][] = []; const p = Math.pow(a!, k!); out.push([`${n(a!)}^${n(k!)}`, Number.isFinite(p) ? n(p, 12) : 'Indefinido em ℝ (base negativa com expoente fracionário, ou 0 elevado a negativo)'])
      if (Number.isInteger(k) && k! >= 1) { if (a! < 0 && k! % 2 === 0) out.push([`${k}√a`, 'Não existe em ℝ (índice par e radicando negativo)']); else out.push([`${k}√a`, n(a! < 0 ? -Math.pow(-a!, 1 / k!) : Math.pow(a!, 1 / k!), 12)]) } else out.push(['Raiz enésima', 'Informe n inteiro ≥ 1'])
      return res(out, ['aⁿ;  ⁿ√a = a^(1/n)'], [], ['Aproximação de ponto flutuante.']) }),
  def('arredondamento', 'Arredondamento decimal', b, 'Calculadoras', '≈', 'Casas decimais com o modo escolhido, sem erro de binário.', ['arredondar', 'casas decimais', 'truncar', 'piso', 'teto'], [F('x|Número'), F('p|Casas decimais (0 a 15)'), SEL('m', 'Modo', ['Meio para cima (comercial)', 'Par mais próximo (bancário)', 'Para baixo (piso)', 'Para cima (teto)', 'Truncar'])],
    ({ x, p, m }) => { if (!Number.isInteger(p) || p! < 0 || p! > 15) return err('Casas decimais: inteiro de 0 a 15.'); const r = roundDecimal(x!, p!, m!); if (r === null) return err('Use valores entre 10⁻⁶ e 10²⁰ (sem notação científica).')
      return res([['Resultado', r]], ['Arredondamento decimal exato sobre a representação decimal digitada'], [], ['Ex.: 2,675 com 2 casas dá 2,68 (meio para cima), sem o erro de 2,67 do binário.']) }),
  def('resto-divisao', 'Divisão inteira e resto', b, 'Números inteiros', 'mod', 'Quociente e resto (euclidiano e truncado).', ['resto', 'módulo', 'divisão euclidiana'], [F('a|Dividendo a'), F('d|Divisor d')],
    ({ a, d }) => { const e = chk([!Number.isInteger(a) || !Number.isInteger(d), 'Informe inteiros.'], [d === 0, 'O divisor não pode ser zero.']); if (e) return e; const q = Math.floor(a! / Math.abs(d!)) * Math.sign(d!), r = a! - q * d!
      return res([['Divisão euclidiana', `${a} = ${d}·(${q}) + ${r}   com 0 ≤ r < |d|`], ['Quociente / resto (euclidiano)', `${q} / ${r}`], ['Quociente / resto (truncado, como em JavaScript)', `${Math.trunc(a! / d!)} / ${a! % d!}`]], ['a = d·q + r,  0 ≤ r < |d|'], [], ['Para a negativo os dois restos diferem: o euclidiano nunca é negativo.']) }),
]
