import { useState } from 'react'
import sampleApplicant from '../../fixtures/sample-applicant.json'
import cleanReport from '@root/fixtures/sample-certn-report.json'
import highRiskReport from '@root/fixtures/sample-certn-report-high-risk.json'
import { submitScreeningApplicant } from '../../lib/certnClient'
import { evaluateScreeningReport, type CertnReport, type TenantRiskEvaluation } from '../../lib/screeningClient'

type Status = 'idle' | 'loading' | 'success' | 'error'

const RISK_TIER_LABEL: Record<TenantRiskEvaluation['riskTier'], string> = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
}

function RiskEvaluationResult({ evaluation }: { evaluation: TenantRiskEvaluation }) {
  return (
    <div className="mono" style={{ marginTop: 12, fontSize: 13 }}>
      <div>
        <b>{RISK_TIER_LABEL[evaluation.riskTier]}</b> — confidence {evaluation.riskTierConfidence.toFixed(2)}, composite
        score {evaluation.compositeScore.toFixed(2)}
      </div>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        <li>Financial risk: {evaluation.dimensions.financialRisk.score.toFixed(1)} / 3</li>
        <li>Tenancy history risk: {evaluation.dimensions.tenancyHistoryRisk.score.toFixed(1)} / 3</li>
        <li>Prior eviction/unpaid-rent order probability: {evaluation.flags.priorEvictionOrder.toFixed(2)}</li>
        <li>Identity mismatch probability: {evaluation.flags.identityMismatch.toFixed(2)}</li>
      </ul>
      {evaluation.requiresManualReview && (
        <div style={{ marginTop: 8 }}>
          <b>Flagged for manual review:</b>
          <ul style={{ paddingLeft: 18 }}>
            {evaluation.reviewReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ScreeningDemo() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const [evalStatus, setEvalStatus] = useState<Status>('idle')
  const [evalError, setEvalError] = useState('')
  const [evaluation, setEvaluation] = useState<TenantRiskEvaluation | null>(null)

  async function runTest() {
    setStatus('loading')
    setMessage('')
    try {
      const result = await submitScreeningApplicant(sampleApplicant)
      setStatus('success')
      setMessage(`Certn applicant created: ${JSON.stringify(result)}`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  async function runRiskEvaluation(report: CertnReport) {
    setEvalStatus('loading')
    setEvalError('')
    setEvaluation(null)
    try {
      const result = await evaluateScreeningReport(report)
      setEvalStatus('success')
      setEvaluation(result)
    } catch (error) {
      setEvalStatus('error')
      setEvalError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="wrap" style={{ marginTop: 32 }}>
      <div className="scope-note">
        <strong>Dev integration check</strong> — sends the sample applicant fixture to{' '}
        <span className="mono">POST /api/certn/applicants</span>, a local dev-server route that calls the
        same <span className="mono">orderScreeningCase()</span> logic as the root project's{' '}
        <span className="mono">src/certn.ts</span> (Certn Centric API). It uses the sandbox unless{' '}
        <span className="mono">CERTN_ENV=production</span> is set in the project root{' '}
        <span className="mono">.env</span> — with <span className="mono">CERTN_PRODUCTION_API_KEY</span> set, every
        click here would order a real billed check, so this panel should come out before the page goes public.
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={runTest} disabled={status === 'loading'}>
            {status === 'loading' ? 'Submitting…' : 'Run sample screening request'}
          </button>
        </div>
        {message && (
          <p className="mono" style={{ marginTop: 12, fontSize: 13, wordBreak: 'break-word' }}>
            {message}
          </p>
        )}
      </div>

      <div className="scope-note" style={{ marginTop: 16 }}>
        <strong>Risk evaluation (Jev)</strong> — sends a completed Certn background check report to{' '}
        <span className="mono">POST /api/screening/evaluate</span>, which runs it through the Landward Report's
        risk evaluator (TypeSafe's Jev model, via Choice/Score/Noul judgments) and returns a risk tier, per-dimension
        scores, and any flags requiring manual review. Requires a real{' '}
        <span className="mono">TYPESAFE_API_KEY</span> in the project root <span className="mono">.env</span>.
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => runRiskEvaluation(cleanReport as CertnReport)}
            disabled={evalStatus === 'loading'}
          >
            {evalStatus === 'loading' ? 'Evaluating…' : 'Evaluate clean applicant'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => runRiskEvaluation(highRiskReport as CertnReport)}
            disabled={evalStatus === 'loading'}
          >
            {evalStatus === 'loading' ? 'Evaluating…' : 'Evaluate high-risk applicant'}
          </button>
        </div>
        {evalStatus === 'error' && (
          <p className="mono" style={{ marginTop: 12, fontSize: 13, wordBreak: 'break-word' }}>
            {evalError}
          </p>
        )}
        {evaluation && <RiskEvaluationResult evaluation={evaluation} />}
      </div>
    </div>
  )
}
