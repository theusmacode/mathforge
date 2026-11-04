import type { Def } from './kit.ts'
import { algebraDefs } from './algebra-defs.ts'
import { statsDefs } from './stats-defs.ts'
import { financeDefs } from './finance-defs.ts'
import { physicsDefs } from './physics-defs.ts'
import { geometryDefs } from './geometry-defs.ts'
import { basicDefs } from './basic-defs.ts'
/** Catálogo declarativo: cada Def traz metadados (registro) + módulo de cálculo. */
export const allDefs: Def[] = [...algebraDefs, ...statsDefs, ...financeDefs, ...physicsDefs, ...geometryDefs, ...basicDefs]
