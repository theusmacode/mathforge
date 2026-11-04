import { def, F, err, n, res, chk, list, SEL, type Def } from './kit.ts'
const G = 9.81, ph = 'fisica'
const g = (v: number | undefined) => v ?? G
const gNote = 'g = 9,81 m/s² se o campo ficar em branco. Modelo idealizado: sem resistência do ar, g constante.'
const G_F = F('g|g (opcional, padrão 9,81)|m/s²|o')
export const physicsDefs: Def[] = [
  def('movimento-uniforme', 'Movimento uniforme (MU)', ph, 'Cinemática', 'MU', 's = s₀ + v·t, com velocidade constante.', ['movimento uniforme', 'posição', 'velocidade constante'], [F('s0|Posição inicial s₀|m'), F('v|Velocidade v|m/s'), F('t|Tempo t|s')],
    ({ s0, v, t }) => chk([t! < 0, 'O tempo não pode ser negativo.']) ?? res([['Posição s', `${n(s0! + v! * t!)} m`], ['Deslocamento Δs', `${n(v! * t!)} m`]], ['s = s₀ + v·t'], [`s = ${n(s0!)} + ${n(v!)}·${n(t!)}`], ['Vale para velocidade constante.'])),
  def('movimento-muv', 'Movimento uniformemente variado (MUV)', ph, 'Cinemática', 'MUV', 'Posição e velocidade com aceleração constante.', ['muv', 'aceleração constante', 'função horária'], [F('s0|Posição inicial|m'), F('v0|Velocidade inicial|m/s'), F('a|Aceleração|m/s²'), F('t|Tempo|s')],
    ({ s0, v0, a, t }) => chk([t! < 0, 'O tempo não pode ser negativo.']) ?? res([['Posição s', `${n(s0! + v0! * t! + 0.5 * a! * t! ** 2)} m`], ['Velocidade v', `${n(v0! + a! * t!)} m/s`]], ['s = s₀ + v₀t + ½at²', 'v = v₀ + at'], [`v = ${n(v0!)} + ${n(a!)}·${n(t!)}`], ['Vale para aceleração constante.'])),
  def('equacao-torricelli', 'Equação de Torricelli', ph, 'Cinemática', 'v²', 'v² = v₀² + 2·a·Δs (sem usar o tempo).', ['torricelli', 'velocidade final'], [F('v0|Velocidade inicial|m/s'), F('a|Aceleração|m/s²'), F('d|Deslocamento Δs|m')],
    ({ v0, a, d }) => { const v2 = v0! ** 2 + 2 * a! * d!; if (v2 < 0) return err('v² seria negativo: com esses dados o móvel não alcança esse deslocamento.'); return res([['v²', `${n(v2)} m²/s²`], ['|v|', `${n(Math.sqrt(v2))} m/s`]], ['v² = v₀² + 2aΔs'], [`O sinal de v depende do sentido do movimento.`]) }),
  def('velocidade-media', 'Velocidade média', ph, 'Cinemática', 'vm', 'Δs/Δt em m/s e km/h.', ['velocidade média'], [F('d|Distância/deslocamento Δs|m'), F('t|Intervalo Δt|s')],
    ({ d, t }) => chk([!(t! > 0), 'O intervalo de tempo deve ser positivo.']) ?? res([['v média', `${n(d! / t!)} m/s`], ['v média', `${n((d! / t!) * 3.6)} km/h`]], ['vₘ = Δs / Δt'], [], ['Distância percorrida e deslocamento só coincidem em trajetória retilínea sem retorno.'])),
  def('aceleracao-media', 'Aceleração média', ph, 'Cinemática', 'am', 'Δv/Δt.', ['aceleração média'], [F('v0|Velocidade inicial|m/s'), F('v|Velocidade final|m/s'), F('t|Intervalo Δt|s')],
    ({ v0, v, t }) => chk([!(t! > 0), 'O intervalo de tempo deve ser positivo.']) ?? res([['Aceleração média', `${n((v! - v0!) / t!)} m/s²`]], ['aₘ = (v − v₀) / Δt'], [])),
  def('queda-livre', 'Queda livre', ph, 'Cinemática', 'QL', 'Tempo e velocidade de impacto de um corpo solto.', ['queda livre', 'gravidade'], [F('h|Altura|m'), G_F],
    ({ h, g: gg }) => chk([!(h! > 0), 'A altura deve ser positiva.'], [!(g(gg) > 0), 'g deve ser positivo.']) ?? res([['Tempo de queda', `${n(Math.sqrt((2 * h!) / g(gg)))} s`], ['Velocidade ao chegar', `${n(Math.sqrt(2 * g(gg) * h!))} m/s`], ['em km/h', `${n(Math.sqrt(2 * g(gg) * h!) * 3.6)}`]], ['t = √(2h/g);  v = g·t = √(2gh)'], [], [gNote])),
  def('lancamento-vertical', 'Lançamento vertical', ph, 'Cinemática', 'LV', 'Altura máxima e tempos de um lançamento para cima.', ['lançamento vertical', 'altura máxima'], [F('v0|Velocidade inicial (para cima)|m/s'), F('h0|Altura inicial (opcional, 0)|m|o'), G_F],
    ({ v0, h0, g: gg }) => { const e = chk([!(v0! > 0), 'A velocidade inicial deve ser positiva.'], [!(g(gg) > 0), 'g deve ser positivo.'], [(h0 ?? 0) < 0, 'A altura inicial não pode ser negativa.']); if (e) return e; const G2 = g(gg), H = h0 ?? 0, hm = H + v0! ** 2 / (2 * G2)
      return res([['Altura máxima', `${n(hm)} m`], ['Tempo de subida', `${n(v0! / G2)} s`], ['Tempo até o solo', `${n((v0! + Math.sqrt(v0! ** 2 + 2 * G2 * H)) / G2)} s`], ['Velocidade ao chegar ao solo', `${n(Math.sqrt(v0! ** 2 + 2 * G2 * H))} m/s (para baixo)`]], ['hₘₐₓ = h₀ + v₀²/2g;  t = [v₀ + √(v₀² + 2gh₀)]/g'], [], [gNote]) }),
  def('trabalho-mecanico', 'Trabalho mecânico', ph, 'Dinâmica', 'W', 'W = F·d·cos θ.', ['trabalho', 'força'], [F('f|Força F|N'), F('d|Deslocamento d|m'), F('a|Ângulo θ entre F e o deslocamento|°')],
    ({ f, d, a }) => chk([d! < 0, 'O deslocamento (módulo) não pode ser negativo.']) ?? res([['Trabalho', `${n(f! * d! * Math.cos((a! * Math.PI) / 180))} J`]], ['W = F·d·cos θ'], [], ['Força constante. W < 0 quando θ > 90° (força se opõe ao movimento).'])),
  def('energia-potencial', 'Energia potencial gravitacional', ph, 'Dinâmica', 'Ep', 'Ep = m·g·h.', ['energia potencial', 'altura'], [F('m|Massa|kg'), F('h|Altura|m'), G_F],
    ({ m, h, g: gg }) => chk([m! < 0, 'A massa não pode ser negativa.']) ?? res([['Ep', `${n(m! * g(gg) * h!)} J`]], ['Ep = m·g·h'], [], ['Altura medida a partir do nível de referência escolhido. ' + gNote])),
  def('potencia-mecanica', 'Potência mecânica', ph, 'Dinâmica', 'P', 'P = W/Δt, com conversão para cv e hp.', ['potência', 'watt', 'cavalo-vapor'], [F('w|Trabalho/energia|J'), F('t|Tempo|s')],
    ({ w, t }) => chk([!(t! > 0), 'O tempo deve ser positivo.']) ?? res([['Potência', `${n(w! / t!)} W`], ['em cv', n(w! / t! / 735.49875)], ['em hp', n(w! / t! / 745.69987158)]], ['P = W / Δt'], [], ['1 cv = 735,49875 W; 1 hp = 745,69987 W.'])),
  def('lei-hooke', 'Lei de Hooke e energia elástica', ph, 'Dinâmica', 'kx', 'F = k·x e Ep = ½·k·x².', ['mola', 'hooke', 'energia elástica'], [F('k|Constante elástica k|N/m'), F('x|Deformação x|m')],
    ({ k, x }) => chk([!(k! > 0), 'k deve ser positivo.']) ?? res([['Força elástica |F|', `${n(Math.abs(k! * x!))} N`], ['Energia potencial elástica', `${n(0.5 * k! * x! ** 2)} J`]], ['F = k·x', 'Ep = ½·k·x²'], [], ['Válido dentro do limite elástico da mola.'])),
  def('densidade', 'Densidade', ph, 'Dinâmica', 'ρ', 'ρ = m/V.', ['densidade', 'massa específica'], [F('m|Massa|kg'), F('v|Volume|m³')],
    ({ m, v }) => chk([!(v! > 0), 'O volume deve ser positivo.'], [m! < 0, 'A massa não pode ser negativa.']) ?? res([['Densidade', `${n(m! / v!)} kg/m³`], ['em g/cm³', n(m! / v! / 1000)]], ['ρ = m / V'], [])),
  def('pressao', 'Pressão', ph, 'Dinâmica', 'p', 'p = F/A.', ['pressão', 'pascal'], [F('f|Força|N'), F('a|Área|m²')],
    ({ f, a }) => chk([!(a! > 0), 'A área deve ser positiva.']) ?? res([['Pressão', `${n(f! / a!)} Pa`], ['em kPa', n(f! / a! / 1000)], ['em atm', n(f! / a! / 101325)]], ['p = F / A'], [], ['1 atm = 101 325 Pa.'])),
  def('resistores', 'Resistores em série ou paralelo', ph, 'Eletricidade', 'Req', 'Resistência equivalente.', ['resistor', 'série', 'paralelo'], [F('r|Resistências|Ω|m'), SEL('k', 'Associação', ['Série', 'Paralelo'])],
    ({ k }, t) => { const r = list(t.r); if (r.some(x => !(x > 0))) return err('As resistências devem ser positivas.'); const eq = k === 1 ? 1 / r.reduce((a, x) => a + 1 / x, 0) : r.reduce((a, b) => a + b, 0)
      return res([['Resistência equivalente', `${n(eq)} Ω`]], [k === 1 ? '1/Req = Σ 1/Rᵢ' : 'Req = Σ Rᵢ'], [`${r.length} resistores`]) }),
]
