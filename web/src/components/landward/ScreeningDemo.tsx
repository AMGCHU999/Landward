import { useState } from 'react'
import sampleApplicant from '../../fixtures/sample-applicant.json'
import { submitScreeningApplicant } from '../../lib/certnClient'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ScreeningDemo() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

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
    </div>
  )
}
