import type { CertnReport, TenantRiskEvaluation } from '@root/screening/types.js'

export type * from '@root/screening/types.js'

export async function evaluateScreeningReport(report: CertnReport): Promise<TenantRiskEvaluation> {
  const response = await fetch('/api/screening/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`)
  }
  return body
}
