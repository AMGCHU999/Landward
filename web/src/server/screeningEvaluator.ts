// Single source of truth lives in the root project; this re-export keeps the
// Vite dev-server bridge from carrying a drifting copy.
export { evaluateTenantRisk } from '../../../src/screening/evaluate.js'
export type * from '../../../src/screening/types.js'
