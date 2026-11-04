/** Unidades alternativas por unidade-SI. O valor digitado é convertido para o SI antes do cálculo. */
export const UNIT_ALTS: Record<string, [string, number][]> = {
  m: [['m', 1], ['km', 1000], ['cm', 0.01], ['mm', 0.001]], 'm/s': [['m/s', 1], ['km/h', 1 / 3.6]], s: [['s', 1], ['min', 60], ['h', 3600]], kg: [['kg', 1], ['g', 0.001], ['t', 1000]],
  N: [['N', 1], ['kN', 1000]], J: [['J', 1], ['kJ', 1000], ['kcal', 4184]], 'm²': [['m²', 1], ['cm²', 1e-4], ['km²', 1e6]], 'm³': [['m³', 1], ['L', 0.001], ['cm³', 1e-6]],
  'm/s²': [['m/s²', 1], ['km/h²', 1 / 12960]], 'N/m': [['N/m', 1], ['N/cm', 100]], V: [['V', 1], ['mV', 0.001], ['kV', 1000]], A: [['A', 1], ['mA', 0.001]], 'Ω': [['Ω', 1], ['kΩ', 1000]],
}
