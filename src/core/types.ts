export interface Field { id: string; label: string; unit?: string; optional?: boolean; text?: boolean; multiline?: boolean; matrix?: 'plain' | 'aug'; options?: { value: number; label: string }[] }
export type Values = Record<string, number | undefined>
export type Result =
  | { ok: true; outputs: { label: string; value: string }[]; formulas: string[]; steps: string[]; notes?: string[]; table?: { head: string[]; rows: string[][] }; chart?: Chart; charts?: Chart[]; compare?: Compare }
  | { ok: false; error: string }
export interface ToolModule { fields: Field[]; compute: (v: Values, t?: Record<string, string>) => Result }

export type Seg = [number, number][]
export type Shape = 'unitcircle' | 'rect' | 'circle' | 'sector' | 'triangle' | 'trapezoid' | 'rhombus' | 'cuboid' | 'cylinder' | 'cone' | 'sphere'
/** Dados reais de visualização, calculados a partir das entradas. */
export type Chart =
  | { kind: 'line'; title: string; x: string; y: string; series: { name: string; segs: Seg[]; dashed?: boolean }[]; area?: [number, number]; marks?: [number, number][] }
  | { kind: 'bars'; title: string; y: string; labels: string[]; values: number[] }
  | { kind: 'scatter'; title: string; x: string; y: string; pts: [number, number][]; fit?: [number, number] }
  | { kind: 'venn'; title: string; a: string[]; b: string[]; only: string[]; both: string[]; onlyB: string[]; nameA: string; nameB: string }
  | { kind: 'fractions'; title: string; rows: { label: string; n: number; d: number }[] }
  | { kind: 'shape'; title: string; shape: Shape; dims: Record<string, number>; labels: Record<string, string>; note?: string }
export interface Compare { a: { label: string; value: number }; b: { label: string; value: number }; unit?: string }
